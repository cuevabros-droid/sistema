import loggerError from '../../negocio/utils/pinoError.js';
import { estudioService } from '../../negocio/services/estudio.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerEstudio(req, res) {

  try {
    const resul = await estudioService.listarEstudio()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerEstudio}


