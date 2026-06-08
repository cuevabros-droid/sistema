import loggerError from '../../negocio/utils/pinoError.js';
import { documentosService } from '../../negocio/services/documentos.service.js';
//import {pool} from '../../daos/db/pgClient.js'



 async function controllerDocumentos(req, res) {

  try {
    const resul = await documentosService.listarDocumentos()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  
}

 async function controllerDocumentosPersona({ params: { id } }, res) {

  try {
    const resul = await documentosService.listarDocumentosPersona(id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  
}


export {controllerDocumentos, controllerDocumentosPersona}


