import loggerError from '../../negocio/utils/pinoError.js';
import { documentosService } from '../../negocio/services/documentos.service.js';



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


async function controllerRegistrarDocumentoPersona({ user, body }, res) {

  try {
    body.usuario_sistema = user.usuario
    const resul = await documentosService.registrarDocumentoPersona(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  
}

async function controllerActualizarDocumentoPersona({ user, body }, res) {

  try {
    body.usuario_sistema = user.usuario
    const resul = await documentosService.actualizarDocumentoPersona(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  
}

async function controllerEliminarDocumentoPersona(req, res) {
  const id = req.params.id

  try {
    const resul = await documentosService.eliminarDocumentoPersona(id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  
}


export {controllerDocumentos, controllerDocumentosPersona, controllerRegistrarDocumentoPersona, controllerActualizarDocumentoPersona, controllerEliminarDocumentoPersona}


