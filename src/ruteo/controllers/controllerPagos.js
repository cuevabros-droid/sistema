import loggerError from '../../negocio/utils/pinoError.js';
import { pagosService } from '../../negocio/services/pagos.service.js';



 async function controllerMedios({user}, res) {
  try {
    const resul = await pagosService.listarMedios()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerMarcas({user}, res) {
  try {
    const resul = await pagosService.listarMarcas()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerEntidades(req, res) {
  try {
    const resul = await pagosService.listarEntidades()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerListado({ params: { id }, user}, res) {
  try {
    const resul = await pagosService.listado(id, user.identidadeducativa)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerUpdate({ user, body }, res) {

    try {
      body.usuario_sistema= user.usuario
      body.id_establecimiento = user.identidadeducativa
      const resul = await pagosService.updatePago(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerCreate({ user, body }, res) {

      try {
        const resul = await pagosService.createPago(body)
        return res.status(201).json(resul)
      } catch (error) {
        loggerError(error.message)
        return res.status(404).json({error: error.message})
      }
    }

    async function controllerDelete(req, res) {
      const id = req.params.id
      try {
        const resul = await pagosService.deletePago(id)
        res.status(201).json(resul)
      } catch (error) {
        loggerError(error.message)
        loggerError(error.message)
        res.status(404).json({error: error.message})
      }
      
    }

export {controllerMarcas, controllerMedios, controllerEntidades, controllerListado, controllerUpdate, controllerCreate, controllerDelete}


