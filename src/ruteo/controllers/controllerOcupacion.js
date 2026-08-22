import loggerError from '../../negocio/utils/pinoError.js';
import { ocupacionService } from '../../negocio/services/ocupacion.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerOcupacion(req, res) {

  try {
    const resul = await ocupacionService.listarOcupacion()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerOcupacion}


