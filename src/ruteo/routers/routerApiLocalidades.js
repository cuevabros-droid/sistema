import express from 'express';
import { controllerLocalidades } from '../controllers/controllerLocalidades.js';


const routerApiLocalidades = express.Router();

//routerApiOrder.post('/', controllerPersons); 
routerApiLocalidades.get('/', controllerLocalidades); 


export default routerApiLocalidades;

