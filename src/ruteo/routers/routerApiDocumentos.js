import express from 'express';
import { controllerDocumentos } from '../controllers/controllerDocumentos.js';
import {controllerDocumentosPersona} from '../controllers/controllerDocumentos.js';

const routerApiDocumentos = express.Router();

routerApiDocumentos.get('/', controllerDocumentos); 
routerApiDocumentos.get('/:id', controllerDocumentosPersona); 


export default routerApiDocumentos;
