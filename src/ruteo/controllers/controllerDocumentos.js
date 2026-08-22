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


async function controllerExistePersona(req, res) {
  try {
    const { tipo, numero } = req.query;

    // 1. Validar primero que vengan los datos
    if (!tipo || !numero) {
      return res.status(400).json({ error: "Debe proporcionar tipo y numero de documento" });
    }

    // 2. Llamar al servicio
    const resul = await documentosService.ExistePersona(tipo, numero);

    // 3. Responder según el resultado del servicio
    if (resul) {
      // Si el servicio devuelve la persona o el id directamente:
      return res.status(200).json({ existe: true });
    } else {
      return res.status(200).json({ existe: false });    }

  } catch (error) {
    console.error("Error en controllerExistePersona:", error);
    return res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
  }
}


export {controllerDocumentos, controllerDocumentosPersona, controllerRegistrarDocumentoPersona, controllerActualizarDocumentoPersona, controllerEliminarDocumentoPersona, controllerExistePersona}


