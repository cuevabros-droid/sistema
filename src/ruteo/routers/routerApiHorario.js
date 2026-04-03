import express from 'express';
import  {controladorPostHorario, controllerHorarios, controllerHorarioConFiltro, controllerHorarioConId, controllerPutHorario, controllerHorarioDelete}  from '../controllers/controllerHorario.js';
import { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiHorario = express.Router();

//routerApiOrder.post('/', controllerPersons); 
routerApiHorario.get('/', controllerHorarios); 
routerApiHorario.post('/', controladorPostHorario); 
routerApiHorario.put('/:id', controllerPutHorario); 
routerApiHorario.get('/:texto', controllerHorarioConFiltro); 
routerApiHorario.get('/id/:id', controllerHorarioConId); 
routerApiHorario.delete('/delete/:id', controllerHorarioDelete); 



export default routerApiHorario;

