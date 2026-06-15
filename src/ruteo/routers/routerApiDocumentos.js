import express from 'express';
import { controllerDocumentos } from '../controllers/controllerDocumentos.js';
import {controllerDocumentosPersona} from '../controllers/controllerDocumentos.js';
import {controllerRegistrarDocumentoPersona} from '../controllers/controllerDocumentos.js';
import {controllerActualizarDocumentoPersona} from '../controllers/controllerDocumentos.js';
import {controllerEliminarDocumentoPersona} from '../controllers/controllerDocumentos.js';

import { autenticacion } from '../../negocio/middlewares/autenticacion.js';

const routerApiDocumentos = express.Router();

routerApiDocumentos.get('/', controllerDocumentos); 
routerApiDocumentos.get('/:id', controllerDocumentosPersona); 
routerApiDocumentos.post('/', autenticacion, controllerRegistrarDocumentoPersona); 
routerApiDocumentos.put('/:id', autenticacion, controllerActualizarDocumentoPersona); 
routerApiDocumentos.delete('/:id', autenticacion, controllerEliminarDocumentoPersona); 



export default routerApiDocumentos;
