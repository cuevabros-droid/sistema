import loggerError from '../../negocio/utils/pinoError.js';
import { horarioService } from '../../negocio/services/horario.service.js';
import {pool} from '../../daos/db/pgClient.js'
//import { crearId } from "../../../src/negocio/utils/randomId.js"

//import pkg from 'pg'
//const { Pool } = pkg;

async function controladorPostHorario(req, res) {

  const objeto = req.body;
  //objeto.id_franja_horaria = crearId()
  const horario = await horarioService.grabarHorario(objeto)

  if(horario.message){
      res.status(500)
      loggerError(horario.message)
  } else{
      res.status(201);
      res.json(horario)
  }
}


async function controllerPutHorario(req, res) {

  const objeto = req.body;
  //objeto.id_franja_horaria = crearId()
  const horario = await horarioService.actualizarHorario(objeto)

  if(horario.message){
      res.status(500)
      loggerError(horario.message)
  } else{
      res.status(201);
      res.json(horario)
  }
}


 async function controllerHorarios(req, res) {

  try {
    const resul = await horarioService.listarHorario()
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

  
 // const getPersonas = async () => {
    //console.log((await pool.query('select apellidos, nombres from persona')).rows);
 
 //   const resul = ((await pool.query('select apellidos, nombres from persona')).rows);
 //   res.status(200).json(resul)  
  //}

 // getPersonas();

}


async function controllerListarPersons(req, res) {

  try {
    const pers = await orderService.listarPerson(req.user)
    res.status(200).json(pers)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerHorarioConFiltro({ params: { texto } }, res) {

  try {
    const resul = await horarioService.listarHorarioconfiltro(texto)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}
   
  
async function controllerHorarioConId({ params: { id } }, res) {

  try {
    const resul = await horarioService.listarHorarioconid(id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerHorarioDelete({ params: { id } }, res) {

  try {
    const resul = await horarioService.eliminarHorario(id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}

   

export {controladorPostHorario, controllerPutHorario, controllerHorarios, controllerListarPersons, controllerHorarioConFiltro, controllerHorarioConId, controllerHorarioDelete}


