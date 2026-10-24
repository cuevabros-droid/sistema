import express from 'express';
import { controllerEjecutarReporte } from '../controllers/controllerReportes.js';
import { autenticacion } from '../../negocio/middlewares/autenticacion.js';

const routerApiReportes = express.Router();

routerApiReportes.post('/ejecutar', autenticacion, controllerEjecutarReporte);

export default routerApiReportes;

