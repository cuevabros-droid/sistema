import loggerError from '../../negocio/utils/pinoError.js';
import { persontService } from '../../negocio/services/person.service.js';
import {pool} from '../../daos/db/pgClient.js';

//import pkg from 'pg'
//const { Pool } = pkg;

 async function controllerPersons(req, res) {

  try {
    const resul = await persontService.listarPersonas(req.user)
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


async function controllerPersonsConFiltro({ params: { texto } }, res) {

  try {
    const resul = await persontService.listarPersonsConFiltro(texto)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}
   
  
export {controllerPersons, controllerListarPersons, controllerPersonsConFiltro}


