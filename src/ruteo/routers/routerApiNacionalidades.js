import express from 'express';
import { controllerNacionalidades } from '../controllers/controllerNacionalidades.js';


const routerApiNacionalidades = express.Router();

routerApiNacionalidades.get('/', controllerNacionalidades); 


export default routerApiNacionalidades;

