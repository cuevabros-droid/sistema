import express from 'express';
import { controllerLocalidades } from '../controllers/controllerLocalidades.js';


const routerApiLocalidades = express.Router();

routerApiLocalidades.get('/', controllerLocalidades); 


export default routerApiLocalidades;

