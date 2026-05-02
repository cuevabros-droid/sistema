import loggerError from '../../negocio/utils/pinoError.js';
import { localidadesService } from '../../negocio/services/localidades.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerLocalidades(req, res) {

  try {
    const resul = await localidadesService.listarLocalidades()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerLocalidades}


