import loggerError from '../../negocio/utils/pinoError.js';
import { escuelaService } from '../../negocio/services/escuela.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerEscuela(req, res) {

  try {
    const resul = await escuelaService.listarEscuela(req.user.identidadeducativa)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerEscuela}


