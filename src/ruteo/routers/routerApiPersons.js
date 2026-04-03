import express from 'express';
import  {controllerPersons}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltro}  from '../controllers/controllerPersons.js';
import  {controllerListarOrders}  from '../controllers/controllerOrders.js';
import { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiPersona = express.Router();

//routerApiOrder.post('/', controllerPersons); 
routerApiPersona.get('/', controllerPersons); 
routerApiPersona.get('/:texto', controllerPersonsConFiltro); 


export default routerApiPersona;

