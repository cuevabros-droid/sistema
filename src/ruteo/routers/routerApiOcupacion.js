import express from 'express';
import { controllerOcupacion } from '../controllers/controllerOcupacion.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiOcupacion = express.Router();

routerApiOcupacion.get('/', autenticacion, controllerOcupacion); 


export default routerApiOcupacion;

