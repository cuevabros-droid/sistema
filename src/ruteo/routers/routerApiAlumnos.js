import express from 'express';
import  {controllerAlumnos}  from '../controllers/controllerAlumnos.js';
import  {controllerAlumnosConFiltro}  from '../controllers/controllerAlumnos.js';
import  {controllerAlumnosUpdate} from '../controllers/controllerAlumnos.js';
import  {controllerAlumnosCreate} from '../controllers/controllerAlumnos.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';



const routerApiAlumno = express.Router();

routerApiAlumno.get('/', autenticacion, controllerAlumnos); 
routerApiAlumno.get('/:id', autenticacion, controllerAlumnosConFiltro); 
routerApiAlumno.put('/:id', autenticacion, controllerAlumnosUpdate); 
routerApiAlumno.post('/', autenticacion, controllerAlumnosCreate); 



export default routerApiAlumno;

