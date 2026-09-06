import express from 'express';
import { controllerMedios } from '../controllers/controllerPagos.js';
import { controllerMarcas } from '../controllers/controllerPagos.js';
import { controllerEntidades } from '../controllers/controllerPagos.js';
import { controllerCargos } from '../controllers/controllerPagos.js';
import { controllerListado } from '../controllers/controllerPagos.js';
import { controllerUpdate } from '../controllers/controllerPagos.js';
import { controllerCreate } from '../controllers/controllerPagos.js';
import { controllerDelete } from '../controllers/controllerPagos.js';
import { controllerCreatePago } from '../controllers/controllerPagos.js';
import { controllerGenerarPagos } from '../controllers/controllerPagos.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';
import {controllerArchivoDebito} from '../controllers/controllerPagos.js';


const routerApiPagos = express.Router();

routerApiPagos.get('/medios', autenticacion, controllerMedios); 
routerApiPagos.get('/marcas', autenticacion, controllerMarcas); 
routerApiPagos.get('/entidades', autenticacion, controllerEntidades); 
routerApiPagos.get('/cargos', autenticacion, controllerCargos); 
routerApiPagos.get('/:id', autenticacion, controllerListado); 
routerApiPagos.post('/', autenticacion, controllerCreate); 
routerApiPagos.put('/', autenticacion, controllerUpdate); 
routerApiPagos.put('/archivoDebito', autenticacion, controllerArchivoDebito); 
routerApiPagos.delete('/:id', autenticacion, controllerDelete); 
routerApiPagos.post('/guardarpago', autenticacion, controllerCreatePago); 
routerApiPagos.post('/generar-cargos', autenticacion, controllerGenerarPagos); 


export default routerApiPagos;

