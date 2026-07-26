import express from 'express';
import  {controllerPersons}  from '../controllers/controllerPersons.js';
import  {controllerPersonsConFiltro}  from '../controllers/controllerPersons.js';
import  {controllerPersonsUpdate} from '../controllers/controllerPersons.js';
import  {controllerPersonsUpdateEstado} from '../controllers/controllerPersons.js';
import  {controllerPersonsCreate} from '../controllers/controllerPersons.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';
import {controllerPersonsSaldos} from '../controllers/controllerPersons.js';
import {controllerAlumnosPorTutor} from '../controllers/controllerPersons.js';
import {controllerAlumnosPorTutorId} from '../controllers/controllerPersons.js';
import {controllerAlumnoTutoresId} from '../controllers/controllerPersons.js';
import {controllerPersonsConFiltroApellidoDocumento} from '../controllers/controllerPersons.js';
import {controllerPersonaAllegadaCreate} from '../controllers/controllerPersons.js';
import {controllerPersonaAllegadaDelete} from '../controllers/controllerPersons.js';
import {controllerPersonaAllegadaUpdate} from '../controllers/controllerPersons.js';


const routerApiPersona = express.Router();

routerApiPersona.get('/', autenticacion, controllerPersons); 
routerApiPersona.get('/:texto', autenticacion, controllerPersonsConFiltro); 
routerApiPersona.put('/:id', autenticacion, controllerPersonsUpdate); 
routerApiPersona.patch('/:id', autenticacion, controllerPersonsUpdateEstado); 
routerApiPersona.post('/', autenticacion, controllerPersonsCreate); 
routerApiPersona.post('/SaldoAlumno/:id', autenticacion, controllerPersonsSaldos ); 
routerApiPersona.post('/AlumnosTutor/:usuario', autenticacion, controllerAlumnosPorTutor);
routerApiPersona.get('/AlumnosTutorId/:id', autenticacion, controllerAlumnosPorTutorId);
routerApiPersona.get('/AlumnoTutoresId/:id',  autenticacion, controllerAlumnoTutoresId);
routerApiPersona.get('/apellidodocumento/:apellidodocumento', autenticacion, controllerPersonsConFiltroApellidoDocumento); 
routerApiPersona.post('/AlumnoTutores/', autenticacion, controllerPersonaAllegadaCreate); 
routerApiPersona.delete('/AlumnoTutores/:id', autenticacion, controllerPersonaAllegadaDelete); 
routerApiPersona.put('/AlumnoTutores/:id', autenticacion, controllerPersonaAllegadaUpdate); 


export default routerApiPersona;

