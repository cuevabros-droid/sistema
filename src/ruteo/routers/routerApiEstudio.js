import express from 'express';
import { controllerEstudio } from '../controllers/controllerEstudio.js';


const routerApiEstudio = express.Router();

routerApiEstudio.get('/', controllerEstudio); 


export default routerApiEstudio;

