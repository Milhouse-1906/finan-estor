import { useState, useEffect } from 'react'
import Input from '../form/Input_temp'
import Select from '../form/Select'
import SubmitButton from '../form/SubmitButton'

import styles from './ProjectForm.module.css'

function ProjectForm({ handleSubmit, btnText, projectData }) {
  const [project, setProject] = useState({
    name: projectData?.name || '',
    budget: projectData?.budget || '',
    category: projectData?.category || null,
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch('http://localhost:8080/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((data) => {
        setCategories(data);
      });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!project.name) newErrors.name = 'O nome do projeto é obrigatório';
    if (!project.budget) newErrors.budget = 'O orçamento do projeto é obrigatório';
    if (!project.category) newErrors.category = 'A categoria do projeto é obrigatória';
    return newErrors;
  };

  const submit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length === 0) {
      handleSubmit(project);
    } else {
      setErrors(newErrors);
    }
  };

  function handleChange(e) {
    setProject({ ...project, [e.target.name]: e.target.value });
  }

  function handleCategory(e) {
    setProject({
      ...project,
      category: {
        id: e.target.value,
        name: e.target.options[e.target.selectedIndex].text,
      },
    });
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <Input
        type="text"
        text="Nome do projeto"
        name="name"
        placeholder="Insira o nome do projeto"
        handleOnChange={handleChange}
        value={project.name}
      />
      {errors.name && <span className={styles.error}>{errors.name}</span>}
      <Input
        type="number"
        text="Orçamento do projeto"
        name="budget"
        placeholder="Insira o orçamento total"
        handleOnChange={handleChange}
        value={project.budget}
      />
      {errors.budget && <span className={styles.error}>{errors.budget}</span>}
      <Select
        name="category_id"
        text="Selecione a categoria"
        options={categories}
        handleOnChange={handleCategory}
        value={project.category ? project.category.id : ''}
      />
      {errors.category && <span className={styles.error}>{errors.category}</span>}
      <SubmitButton text={btnText} />
    </form>
  );
}

export default ProjectForm;
