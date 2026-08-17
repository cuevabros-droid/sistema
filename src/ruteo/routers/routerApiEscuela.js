import express from 'express';
import { controllerEscuela } from '../controllers/controllerEscuela.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiEscuela = express.Router();

routerApiEscuela.get('/', autenticacion, controllerEscuela); 


export default routerApiEscuela;

