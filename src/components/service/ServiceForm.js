import { useState } from 'react'
import Input from '../form/Input_temp'
import SubmitButton from '../form/SubmitButton'

import styles from '../project/ProjectForm.module.css'

function ServiceForm({ handleSubmit, btnText, projectData }) {
  const [service, setService] = useState({})
  const [errors, setErrors] = useState({})

  const submit = (e) => {
    e.preventDefault()

    // Verificar se todos os campos estão preenchidos
    const newErrors = {}
    if (!service.name) newErrors.name = 'Nome do serviço é obrigatório'
    if (!service.cost) newErrors.cost = 'Custo do serviço é obrigatório'
    if (!service.description) newErrors.description = 'Descrição do serviço é obrigatória'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    projectData.services.push(service)
    handleSubmit(projectData)
  }

  function handleChange(e) {
    setService({ ...service, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <Input
        type="text"
        text="Nome do serviço"
        name="name"
        placeholder="Insira o nome do serviço"
        handleOnChange={handleChange}
        required
      />
      {errors.name && <p className={styles.error}>{errors.name}</p>}
      
      <Input
        type="number"
        text="Custo do serviço"
        name="cost"
        placeholder="Insira o valor total"
        handleOnChange={handleChange}
        required
      />
      {errors.cost && <p className={styles.error}>{errors.cost}</p>}
      
      <Input
        type="text"
        text="Descrição do serviço"
        name="description"
        placeholder="Descreva o serviço"
        handleOnChange={handleChange}
        required
      />
      {errors.description && <p className={styles.error}>{errors.description}</p>}
      
      <SubmitButton text={btnText} />
    </form>
  )
}

export default ServiceForm
