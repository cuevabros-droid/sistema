import express from 'express';
import { controllerDocumentos } from '../controllers/controllerDocumentos.js';


const routerApiDocumentos = express.Router();

routerApiDocumentos.get('/', controllerDocumentos); 


export default routerApiDocumentos;
