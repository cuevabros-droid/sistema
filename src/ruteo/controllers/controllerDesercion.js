import loggerError from '../../negocio/utils/pinoError.js';
import { desercionService } from '../../negocio/services/desercion.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerDesercion(req, res) {

  try {
    const resul = await desercionService.listarDesercion()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerDesercion}


