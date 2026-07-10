import loggerError from '../../negocio/utils/pinoError.js';
import { tipoallegadoService } from '../../negocio/services/tipoallegado.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerTipoAllegado(req, res) {

  try {
    const resul = await tipoallegadoService.listarTipoallegado()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerTipoAllegado}


