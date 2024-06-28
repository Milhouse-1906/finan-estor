

import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'

import styles from './Project.module.css'

import Loading from '../layout/Loading'
import Container from '../layout/Container'
import ProjectForm from '../project/ProjectForm'
import Message from '../layout/Message'
import ServiceForm from '../service/ServiceForm'
import ServiceCard from '../service/ServiceCard'

function Project() {
  let { id } = useParams()
  const [project, setProject] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [services, setServices] = useState([])
  const [message, setMessage] = useState('')
  const [type, setType] = useState('success')

  useEffect(() => {
    fetch(`http://localhost:8080/projects/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('A resposta da rede não foi bem-sucedida');
        }
        return resp.json(); 
      })
      .then((data) => {
        setProject(data);
        setServices(data.services);
      })
      .catch((error) => {
        console.error('Erro ao buscar detalhes do projeto:', error);
  
      });
  }, [id]);
  

  function editPost(project) {
    if (project.budget < project.cost) {
      setMessage('O Orçamento não pode ser menor que o custo do projeto!');
      setType('error');
      return false;
    }
  
    fetch(`http://localhost:8080/projects/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error('A resposta da rede não foi bem-sucedida');
        }
        return resp.json(); 
      })
      .then((data) => {
        setProject(data);
        setShowProjectForm(!showProjectForm);
        setMessage('Projeto atualizado!');
        setType('success');
      })
      .catch((error) => {
        console.error('Erro ao editar projeto:', error);
        setMessage('Erro ao editar projeto. Tente novamente mais tarde.');
        setType('error');
      
      });
  }

  function createService(project, id) {
    if (!project || !project.services || project.services.length === 0) {
        console.error('Project or project services not defined properly.');
        return false;
    }

    const lastService = project.services[project.services.length - 1];
    lastService.id = id;

    const lastServiceCost = parseFloat(lastService.cost);
    const newCost = parseFloat(project.cost) + lastServiceCost;

    if (newCost > parseFloat(project.budget)) {
        setMessage('Orçamento ultrapassado, verifique o valor do serviço!');
        setType('error');
        project.services.pop();
        return false;
    }

    project.cost = newCost;

    fetch(`http://localhost:8080/projects/service/${project.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
    })
    .then(resp => {
        if (!resp.ok) {
            throw new Error('A resposta da rede não foi bem-sucedida');
        }
        return resp.json();
    })
    .then(data => {
        // Atualiza os serviços com os dados retornados após a modificação
        setServices(data.services); // Verifique se `setServices` está corretamente implementada
        setShowServiceForm(false); // Altere o estado do formulário de serviço se necessário
        setMessage('Serviço adicionado!');
        setType('success');
    })
    .catch(error => {
        console.error('Erro ao adicionar serviço:', error);
        setMessage('Erro ao adicionar serviço. Tente novamente mais tarde.');
        setType('error');
    });
}

  
function removeService(id, cost) {
  fetch(`http://localhost:8080/service/${id}`, {  
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then((resp) => {
    if (!resp.ok) {
      throw new Error('A resposta da rede não foi bem-sucedida');
    }
    return resp.json().catch(() => ({})); // Trata resposta vazia ou inválida como um objeto vazio {}
  })
  .then((data) => {
    // Atualize o estado local após a exclusão
    const servicesUpdated = project.services.filter(
      (service) => service.id !== id,
    )

    const projectUpdated = project

    projectUpdated.services = servicesUpdated
    projectUpdated.cost = parseFloat(projectUpdated.cost) - parseFloat(cost)

    // Atualize o estado local imediatamente
    setProject(projectUpdated);
    setServices(servicesUpdated);
    setMessage('Serviço removido com sucesso!');
  })
  .catch((error) => {
    console.error('Erro ao remover serviço:', error);
    setMessage('Erro ao remover serviço. Tente novamente mais tarde.');
    setType('error');
  });
}

  function toggleProjectForm() {
    setShowProjectForm(!showProjectForm)
  }

  function toggleServiceForm() {
    setShowServiceForm(!showServiceForm)
  }

  return (
    <>
      {project.name ? (
        <div className={styles.project_details}>
          <Container customClass="column">
            {message && <Message type={type} msg={message} />}
            <div className={styles.details_container}>
              <h1>Projeto: {project.name}</h1>
              <button className={styles.btn} onClick={toggleProjectForm}>
                {!showProjectForm ? 'Editar projeto' : 'Fechar'}
              </button>
              {!showProjectForm ? (
                <div className={styles.form}>
                  <p>
                    <span>Categoria:</span> {project.category.name}
                  </p>
                  <p>
                    <span>Total do orçamento:</span> R${project.budget}
                  </p>
                  <p>
                    <span>Total utilizado:</span> R${project.cost}
                  </p>
                </div>
              ) : (
                <div className={styles.form}>
                  <ProjectForm
                    handleSubmit={editPost}
                    btnText="Concluir Edição"
                    projectData={project}
                  />
                </div>
              )}
            </div>
            <div className={styles.service_form_container}>
              <h2>Adicione um serviço:</h2>
              <button className={styles.btn} onClick={toggleServiceForm}>
                {!showServiceForm ? 'Adicionar Serviço' : 'Fechar'}
              </button>
              <div className={styles.form}>
                {showServiceForm && (
                  <ServiceForm
                    handleSubmit={createService}
                    btnText="Adicionar Serviço"
                    projectData={project}
                  />
                )}
              </div>
            </div>
            <h2>Serviços:</h2>
            <Container customClass="start">
              {services.length > 0 &&
                services.map((service) => (
                  <ServiceCard
                    id={service.id}
                    name={service.name}
                    cost={service.cost}
                    description={service.description}
                    key={service.id}
                    handleRemove={removeService}
                  />
                ))}
              {services.length === 0 && <p>Não há serviços cadastrados.</p>}
            </Container>
          </Container>
        </div>
      ) : (
        <Loading />
      )}
    </>
  )
}

export default Project
