import express from 'express';
import { controllerMedios } from '../controllers/controllerPagos.js';
import { controllerMarcas } from '../controllers/controllerPagos.js';
import { controllerEntidades } from '../controllers/controllerPagos.js';
import { controllerListado } from '../controllers/controllerPagos.js';
import { controllerUpdate } from '../controllers/controllerPagos.js';
import { controllerCreate } from '../controllers/controllerPagos.js';
import { controllerDelete } from '../controllers/controllerPagos.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiPagos = express.Router();

routerApiPagos.get('/medios', autenticacion, controllerMedios); 
routerApiPagos.get('/marcas', autenticacion, controllerMarcas); 
routerApiPagos.get('/entidades', autenticacion, controllerEntidades); 
routerApiPagos.get('/:id', autenticacion, controllerListado); 
routerApiPagos.post('/', autenticacion, controllerCreate); 
routerApiPagos.put('/', autenticacion, controllerUpdate); 
routerApiPagos.delete('/:id', autenticacion, controllerDelete); 

export default routerApiPagos;

