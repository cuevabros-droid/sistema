import loggerError from '../../negocio/utils/pinoError.js';
import { marcadoresService } from '../../negocio/services/marcadores.service..js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerMarcadores(req, res) {

  try {
    const resul = await marcadoresService.listarMarcadores()
    console.log(resul)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
}


export {controllerMarcadores}


