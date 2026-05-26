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
    const pers = await orderService.listarPerson(req.user)
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
    body.usuario = user.usuario
    const resul = await persontService.updatePersons(body, id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }


  async function controllerPersonsUpdateEstado({ user, params: { id } }, res) {
    
      const usuario = user.usuario

      const objeto = {
        id,
        usuario
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
      body.usuario = user.usuario
      const resul = await persontService.PersonsCreate(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

  
export {controllerPersons, controllerListarPersons, controllerPersonsConFiltro, controllerPersonsConFiltroApellido, controllerPersonsUpdate, controllerPersonsUpdateEstado, controllerPersonsCreate}


