import express from 'express';
import { controllerOcupacion } from '../controllers/controllerOcupacion.js';


const routerApiOcupacion = express.Router();

routerApiOcupacion.get('/', controllerOcupacion); 


export default routerApiOcupacion;

