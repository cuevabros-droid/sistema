import loggerError from '../../negocio/utils/pinoError.js';
import { persontService } from '../../negocio/services/person.service.js';
import {pool} from '../../daos/db/pgClient.js';


 async function controllerPersons(req, res) {

  try {
    const resul = await persontService.listarPersonas()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerListarPersons(req, res) {

  try {
    const pers = await persontService.listarPerson(req.user)
    res.status(200).json(pers)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerPersonsConFiltro({ params: { texto } }, res) {
  try {
    const resul = await persontService.listarPersonsConFiltro(texto)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}
   

async function controllerPersonsConFiltroApellido({ params: { apellido } }, res) {
  try {
    const resul = await persontService.listarPersonsConFiltroApellido(apellido)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerPersonsUpdate({ user, body, params: { id } }, res) {
   
  try {
    body.usuario_sistema= user.usuario
    const resul = await persontService.updatePersons(body, id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }


  async function controllerPersonsUpdateEstado({ user, params: { id } }, res) {
    
      const usuario_sistema = user.usuario

      const objeto = {
        id,
        usuario_sistema
      }
     

    try {

      const resul = await persontService.updatePersonsEstado(objeto)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerPersonsCreate({ user, body }, res) {
    try {
      body.usuario_sistema = user.usuario
      const resul = await persontService.PersonsCreate(body)
      return res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      return res.status(404).json({error: error.message})
    }
  }


    async function controllerPersonsSaldos({ user, params: { id } }, res){
      try {
    const resul = await persontService.listarSaldoAlumnoPorId(id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }
  
  async function controllerAlumnosPorTutor({ user, params: { usuario } }, res){
      try {
    const resul = await persontService.listarAlumnosPorUsuario(usuario)
    res.status(201).json(resul)
     } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
     }
  }

    async function controllerAlumnosPorTutorId({ user, params: { id } }, res){
      try {
        const resul = await persontService.listarAlumnosPorId(id)
        res.status(201).json(resul)
        } catch (error) {
        loggerError(error.message)
        res.status(404).json({error: error.message})
     }
  }

      
  async function controllerAlumnoTutoresId({ user, params: { id } }, res){
      try {
        const resul = await persontService.listarTutoresPorId(id)
        res.status(201).json(resul)
        } catch (error) {
        loggerError(error.message)
        res.status(404).json({error: error.message})
     }
  }


  async function controllerPersonsConFiltroApellidoDocumento({ params: { apellidodocumento } }, res) {
    //console.log(apellidodocumento)
  try {
    const resul = await persontService.listarPersonsConFiltroApellidoDocumento(apellidodocumento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}
  
export {controllerPersons, controllerListarPersons, controllerPersonsConFiltro, controllerPersonsConFiltroApellido, controllerPersonsUpdate, controllerPersonsUpdateEstado, controllerPersonsCreate, controllerPersonsSaldos, controllerAlumnosPorTutor, controllerAlumnosPorTutorId, controllerAlumnoTutoresId, controllerPersonsConFiltroApellidoDocumento}


