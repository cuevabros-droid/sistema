import express from 'express';
import { controllerGrado } from '../controllers/controllerAcademica.js';
import { controllerGradoPost } from '../controllers/controllerAcademica.js';
import { controllerGradoPut } from '../controllers/controllerAcademica.js';
import { controllerGradoDelete } from '../controllers/controllerAcademica.js';
import { controllerNivel } from '../controllers/controllerAcademica.js';
import { controllerNivelPost } from '../controllers/controllerAcademica.js';
import { controllerNivelPut } from '../controllers/controllerAcademica.js';
import { controllerNivelDelete } from '../controllers/controllerAcademica.js';
import { controllerDivision } from '../controllers/controllerAcademica.js';
import { controllerDivisionPost } from '../controllers/controllerAcademica.js';
import { controllerDivisionPut } from '../controllers/controllerAcademica.js';
import { controllerDivisionDelete } from '../controllers/controllerAcademica.js';
import { controllerAnioCursado } from '../controllers/controllerAcademica.js';
import { controllerAnioCursadoPost } from '../controllers/controllerAcademica.js';
import { controllerAnioCursadoPut } from '../controllers/controllerAcademica.js';
import { controllerAnioCursadoDelete } from '../controllers/controllerAcademica.js';
import { controllerListado } from '../controllers/controllerAcademica.js';
import { controllerAcademicaUpdate } from '../controllers/controllerAcademica.js';
import { controllerAcademicaCreate } from '../controllers/controllerAcademica.js';
import { controllerAcademicaDelete } from '../controllers/controllerAcademica.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiAcademica = express.Router();

routerApiAcademica.get('/grado', autenticacion, controllerGrado); 
routerApiAcademica.post('/grado', autenticacion, controllerGradoPost); 
routerApiAcademica.put('/grado/:id', autenticacion, controllerGradoPut); 
routerApiAcademica.delete('/grado/:id', autenticacion, controllerGradoDelete); 
routerApiAcademica.get('/nivel', autenticacion, controllerNivel); 
routerApiAcademica.post('/nivel', autenticacion, controllerNivelPost); 
routerApiAcademica.put('/nivel/:id', autenticacion, controllerNivelPut); 
routerApiAcademica.delete('/nivel/:id', autenticacion, controllerNivelDelete); 
routerApiAcademica.get('/division', autenticacion, controllerDivision); 
routerApiAcademica.post('/division', autenticacion, controllerDivisionPost); 
routerApiAcademica.put('/division/:id', autenticacion, controllerDivisionPut); 
routerApiAcademica.delete('/division/:id', autenticacion, controllerDivisionDelete); 
routerApiAcademica.get('/aniocursado', autenticacion, controllerAnioCursado); 
routerApiAcademica.post('/aniocursado', autenticacion, controllerAnioCursadoPost); 
routerApiAcademica.put('/aniocursado/:id', autenticacion, controllerAnioCursadoPut); 
routerApiAcademica.delete('/aniocursado/:id', autenticacion, controllerAnioCursadoDelete); 
routerApiAcademica.get('/:id', autenticacion, controllerListado); 
routerApiAcademica.post('/', autenticacion, controllerAcademicaCreate); 
routerApiAcademica.put('/', autenticacion, controllerAcademicaUpdate); 
routerApiAcademica.delete('/:id', autenticacion, controllerAcademicaDelete); 

export default routerApiAcademica;

