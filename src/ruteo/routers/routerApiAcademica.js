import express from 'express';
import { controllerGrado } from '../controllers/controllerAcademica.js';
import { controllerDivision } from '../controllers/controllerAcademica.js';
import { controllerAnioCursado } from '../controllers/controllerAcademica.js';
import { controllerListado } from '../controllers/controllerAcademica.js';
import { controllerAcademicaUpdate } from '../controllers/controllerAcademica.js';
import { controllerAcademicaCreate } from '../controllers/controllerAcademica.js';
import { controllerAcademicaDelete } from '../controllers/controllerAcademica.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiAcademica = express.Router();

routerApiAcademica.get('/grado', autenticacion, controllerGrado); 
routerApiAcademica.get('/division', autenticacion, controllerDivision); 
routerApiAcademica.get('/aniocursado', autenticacion, controllerAnioCursado); 
routerApiAcademica.get('/:id', autenticacion, controllerListado); 
routerApiAcademica.post('/', autenticacion, controllerAcademicaCreate); 
routerApiAcademica.put('/', autenticacion, controllerAcademicaUpdate); 
routerApiAcademica.delete('/:id', autenticacion, controllerAcademicaDelete); 

export default routerApiAcademica;

