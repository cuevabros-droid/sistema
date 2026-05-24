import express from 'express';
import  {controllerPersons}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltro}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltroApellido}  from '../controllers/controllerPersons.js';
import {controllerPersonsUpdate} from '../controllers/controllerPersons.js';
import { controllerPersonsUpdateEstado } from '../controllers/controllerPersons.js';
import { autenticacion } from '../../negocio/middlewares/autenticacion.js';



const routerApiPersona = express.Router();

//routerApiOrder.post('/', controllerPersons); 
routerApiPersona.get('/', controllerPersons); 
routerApiPersona.get('/apellido/:apellido', controllerPersonsConFiltroApellido); 
routerApiPersona.get('/:texto', controllerPersonsConFiltro); 
<<<<<<< HEAD
routerApiPersona.get('/:id', controllerPersonsUpdate);
=======
routerApiPersona.put('/:id', controllerPersonsUpdate); 
routerApiPersona.patch('/:id', controllerPersonsUpdateEstado); 
>>>>>>> d9512d2a67aab883054b53d318b1913a9653fac9



export default routerApiPersona;

