import express from 'express';
import { controladorParametros } from '../controllers/controllerParametros.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiParametros = express.Router();


routerApiParametros.get('/', autenticacion, controladorParametros); 


export default routerApiParametros;