import express from 'express';
import { controllerTipoAllegado } from '../controllers/controllerTipoAllegado.js';


const routerApiTipoAllegado = express.Router();

routerApiTipoAllegado.get('/', controllerTipoAllegado); 


export default routerApiTipoAllegado;

