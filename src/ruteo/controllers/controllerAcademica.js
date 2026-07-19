import loggerError from '../../negocio/utils/pinoError.js';
import { academicaService } from '../../negocio/services/academica.service.js';



 async function controllerGrado({user}, res) {
  try {
    const resul = await academicaService.listarGrado(user.identidadeducativa)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerDivision({user}, res) {
  try {
    const resul = await academicaService.listarDivision(user.identidadeducativa)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerAnioCursado(req, res) {
  try {
    const resul = await academicaService.listarAnioCursado()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerListado({ params: { id }, user}, res) {
  try {
    const resul = await academicaService.listado(id, user.identidadeducativa)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerAcademicaUpdate({ user, body }, res) {

    try {
      body.usuario_sistema= user.usuario
      body.id_establecimiento = user.identidadeducativa
      const resul = await academicaService.updateAcademica(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerAcademicaCreate({ user, body }, res) {
      try {
        const resul = await academicaService.createAcademica(body)
        return res.status(201).json(resul)
      } catch (error) {
        loggerError(error.message)
        return res.status(404).json({error: error.message})
      }
    }

    async function controllerAcademicaDelete(req, res) {
      const id = req.params.id
      try {
        const resul = await academicaService.deleteAcademica(id)
        res.status(201).json(resul)
      } catch (error) {
        loggerError(error.message)
        loggerError(error.message)
        res.status(404).json({error: error.message})
      }
      
    }

export {controllerGrado, controllerDivision, controllerAnioCursado, controllerListado, controllerAcademicaUpdate, controllerAcademicaCreate, controllerAcademicaDelete }


