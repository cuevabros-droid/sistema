import express from 'express';
import { controllerDesercion } from '../controllers/controllerDesercion.js';


const routerApiDesercion = express.Router();

routerApiDesercion.get('/', controllerDesercion); 


export default routerApiDesercion;

