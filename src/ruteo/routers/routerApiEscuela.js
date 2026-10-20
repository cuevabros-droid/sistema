import express from 'express';
import { controllerEscuela } from '../controllers/controllerEscuela.js';
import { controllerEscuelas } from '../controllers/controllerEscuela.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiEscuela = express.Router();

routerApiEscuela.get('/', autenticacion, controllerEscuela); 
routerApiEscuela.get('/todas', autenticacion, controllerEscuelas); 


export default routerApiEscuela;

