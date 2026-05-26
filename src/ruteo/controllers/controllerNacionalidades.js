import loggerError from '../../negocio/utils/pinoError.js';
import { nacionalidadesService } from '../../negocio/services/nacionalidades.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerNacionalidades(req, res) {

  try {
    const resul = await nacionalidadesService.listarNacionalidades()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerNacionalidades}


