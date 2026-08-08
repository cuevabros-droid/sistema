import express from 'express';
import  {controllerMarcadores}  from '../controllers/controllerMarcadores.js';

import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';



const routerApiMarcadores = express.Router();

routerApiMarcadores.get('/:id', autenticacion, controllerMarcadores); 




export default routerApiMarcadores;

