import express from 'express';
import { controllerDesercion } from '../controllers/controllerDesercion.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiDesercion = express.Router();

routerApiDesercion.get('/', autenticacion, controllerDesercion);


export default routerApiDesercion;

