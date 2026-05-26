import express from 'express';
import  {controllerPersons}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltro}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltroApellido}  from '../controllers/controllerPersons.js';
import  {controllerPersonsUpdate} from '../controllers/controllerPersons.js';
import  {controllerPersonsUpdateEstado} from '../controllers/controllerPersons.js';
import  {controllerPersonsCreate} from '../controllers/controllerPersons.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';



const routerApiPersona = express.Router();

//routerApiOrder.post('/', controllerPersons); 
routerApiPersona.get('/', autenticacion, controllerPersons); 
routerApiPersona.get('/apellido/:apellido', autenticacion, controllerPersonsConFiltroApellido); 
routerApiPersona.get('/:texto', autenticacion, controllerPersonsConFiltro); 
routerApiPersona.put('/:id', autenticacion, controllerPersonsUpdate); 
routerApiPersona.patch('/:id', autenticacion, controllerPersonsUpdateEstado); 
routerApiPersona.post('/', autenticacion, controllerPersonsCreate); 



export default routerApiPersona;

