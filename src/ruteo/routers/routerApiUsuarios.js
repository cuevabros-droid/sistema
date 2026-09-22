import express from 'express';
import {controladorTipoUsuarios} from '../controllers/controllerUsuarios.js';
import {controladorUsuarios} from '../controllers/controllerUsuarios.js';
import {controladorTutoresSinUsuario} from '../controllers/controllerUsuarios.js';
import {controladorUsuariosCrear} from '../controllers/controllerUsuarios.js';
import {controladorUsuariosCrearEnMasa} from '../controllers/controllerUsuarios.js';
import {esAdmin} from '../../negocio/middlewares/esAdmin.js';
import  { autenticacion } from '../../negocio/middlewares/autenticacion.js';
import upload from '../../negocio/utils/multer.js'; // O la ruta donde tengas configurado multer


const routerApiUser = express.Router();

routerApiUser.get('/', autenticacion, controladorUsuarios);
routerApiUser.post('/', autenticacion, controladorUsuariosCrear);
routerApiUser.get('/tipo_usuarios', autenticacion, controladorTipoUsuarios);
routerApiUser.get('/tutores-sin-usuario', autenticacion, controladorTutoresSinUsuario);
routerApiUser.post('/tutores-sin-usuario/procesar', autenticacion, controladorUsuariosCrearEnMasa);

// Ruta para subir la imagen de usuario
routerApiUser.post('/upload-imagen', upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    // Retorna la ruta relativa donde multer guardó el archivo
    const relativePath = `/img/usuarios/${req.file.filename}`;
    return res.status(200).json({ path: relativePath });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


export default routerApiUser;
