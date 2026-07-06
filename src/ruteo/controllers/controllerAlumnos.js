import loggerError from '../../negocio/utils/pinoError.js';
import { alumnosService } from '../../negocio/services/alumnos.service.js';
import {pool} from '../../daos/db/pgClient.js';


 async function controllerAlumnos(req, res) {

  try {
    const resul = await alumnosService.listarAlumnos()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerListarAlumnos(req, res) {

  try {
    const pers = await alumnosService.listarAlumnos(req.user)
    res.status(200).json(pers)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerAlumnosConFiltro( { id_establecimiento, params: { id } }, res) {
  try {
    id_establecimiento = 1
    const resul = await alumnosService.listarAlumnosConFiltro(id, id_establecimiento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}
   

async function controllerAlumnosConFiltroApellido({ params: { apellido } }, res) {
  try {
    const resul = await alumnosService.listarAlumnosConFiltroApellido(apellido)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerAlumnosUpdate({ user, body }, res) {
   
  try {
    body.usuario_sistema= user.usuario
    const resul = await alumnosService.updateAlumnos(body)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }


  async function controllerAlumnosUpdateEstado({ user, params: { id } }, res) {
    
      const usuario_sistema = user.usuario

      const objeto = {
        id,
        usuario_sistema
      }
     

    try {

      const resul = await alumnosService.updateAlumnosEstado(objeto)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

    async function controllerAlumnosCreate({ user, body }, res) {
    //  console.log("acá está el controlador!!!!")
    //  console.log(user)
    try {
      body.usuario_sistema = user.usuario
    //  body.id_establecimiento = identidadeducativa
      const resul = await alumnosService.AlumnosCreate(body)
      return res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      return res.status(404).json({error: error.message})
    }
  }

  
export {controllerAlumnos, controllerListarAlumnos, controllerAlumnosConFiltro, controllerAlumnosConFiltroApellido, controllerAlumnosUpdate, controllerAlumnosUpdateEstado, controllerAlumnosCreate}


