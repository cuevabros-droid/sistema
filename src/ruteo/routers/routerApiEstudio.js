import express from 'express';
import { controllerEstudio } from '../controllers/controllerEstudio.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiEstudio = express.Router();

routerApiEstudio.get('/', autenticacion, controllerEstudio); 


export default routerApiEstudio;

