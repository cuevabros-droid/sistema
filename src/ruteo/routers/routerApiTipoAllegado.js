import express from 'express';
import { controllerTipoAllegado } from '../controllers/controllerTipoAllegado.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiTipoAllegado = express.Router();

routerApiTipoAllegado.get('/', autenticacion, controllerTipoAllegado); 


export default routerApiTipoAllegado;

