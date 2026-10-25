import loggerError from '../../negocio/utils/pinoError.js';
import { academicaService } from '../../negocio/services/academica.service.js';



 async function controllerGrado({user, query}, res) {
  
  try {
    // Toma id_establecimiento de query si está presente; de lo contrario usa el del usuario
    const idEstablecimiento = query?.id_establecimiento 
      ? Number(query.id_establecimiento) 
      : Number(user?.identidadeducativa);

    const resul = await academicaService.listarGrado(idEstablecimiento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerNivel({user, query}, res) {
  try {
        // Toma id_establecimiento de query si está presente; de lo contrario usa el del usuario
    const idEstablecimiento = query?.id_establecimiento 
      ? Number(query.id_establecimiento) 
      : Number(user?.identidadeducativa);

    const resul = await academicaService.listarNivel(idEstablecimiento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerDivision({user, query}, res) {
  try {
        // Toma id_establecimiento de query si está presente; de lo contrario usa el del usuario
    const idEstablecimiento = query?.id_establecimiento || user?.identidadeducativa

    const resul = await academicaService.listarDivision(idEstablecimiento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

 async function controllerAnioCursado({user, query}, res) {
  try {
            // Toma id_establecimiento de query si está presente; de lo contrario usa el del usuario
    const idEstablecimiento = query?.id_establecimiento || user?.identidadeducativa

    const resul = await academicaService.listarAnioCursado(idEstablecimiento)
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

export {controllerGrado, controllerDivision, controllerAnioCursado, controllerListado, controllerAcademicaUpdate, controllerAcademicaCreate, controllerAcademicaDelete, controllerNivel }


