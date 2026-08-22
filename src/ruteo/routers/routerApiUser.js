import express from 'express';
import {controladorRegistro} from '../controllers/controllerUser.js';
import {controladorInfousuario} from '../controllers/controllerUser.js';
import {esAdmin} from '../../negocio/middlewares/esAdmin.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';


const routerApiUser = express.Router();


routerApiUser.post('/api/users', autenticacion, esAdmin, controladorRegistro);
routerApiUser.get('/api/users', autenticacion, controladorInfousuario);


export default routerApiUser;
