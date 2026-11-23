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



async function controllerGradoPost({ user, body }, res) {
  console.log(body)
  try {
    body.usuario = user.usuario
    const resul = await academicaService.crearGrado(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerGradoPut({ params: { id }, user, body }, res) {

    try {
      body.usuario_sistema= user.usuario
      body.id = id
      const resul = await academicaService.updateGrado(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerGradoDelete({ params: { id }, user }, res) {

    try {
      const resul = await academicaService.deleteGrado(id)
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

 async function controllerNivelPost({ user, body }, res) {
  try {
    body.usuario = user.usuario
    const resul = await academicaService.crearNivel(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerNivelPut({ params: { id }, user, body }, res) {

    try {
      body.usuario_sistema= user.usuario
      body.id = id
      const resul = await academicaService.updateNivel(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerNivelDelete({ params: { id }, user }, res) {

    try {
      const resul = await academicaService.deleteNivel(id)
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


 async function controllerDivisionPost({ user, body }, res) {
  try {
    body.usuario = user.usuario
    const resul = await academicaService.crearDivision(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerDivisionPut({ params: { id }, user, body }, res) {

    try {
      body.usuario_sistema= user.usuario
      body.id = id
      const resul = await academicaService.updateDivision(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerDivisionDelete({ params: { id }, user }, res) {

    try {
      const resul = await academicaService.deleteDivision(id)
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


 async function controllerAnioCursadoPost({ user, body }, res) {
  console.log(body)
  try {
    body.usuario = user.usuario
    const resul = await academicaService.crearAnioCursado(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerAnioCursadoPut({ params: { id }, user, body }, res) {
   //console.log(body)
    try {
      body.usuario_sistema= user.usuario
      body.id = id
      const resul = await academicaService.updateAnioCursado(body)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerAnioCursadoDelete({ params: { id }, user }, res) {

    try {
      const resul = await academicaService.deleteAnioCursado(id)
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
        body.usuario = user.usuario
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

export {controllerGrado, controllerDivision, controllerDivisionPost, controllerDivisionPut, controllerDivisionDelete, controllerAnioCursado, controllerListado, controllerAcademicaUpdate, controllerAcademicaCreate, controllerAcademicaDelete, controllerNivel, controllerNivelPost, controllerNivelPut, controllerNivelDelete, controllerGradoPost, controllerGradoPut, controllerGradoDelete, controllerAnioCursadoPost, controllerAnioCursadoPut, controllerAnioCursadoDelete }


