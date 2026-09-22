import Usuario from '../models/user.js'
import { User } from '../repository/user/index.js';
import { createHash } from '../utils/bcrypt.js';
import nodemailer from '../utils/nodemailer.js'
import {EMAILADMIN} from '../../config/config.js'


//import Horario from '../models/horario.js'
import { TipoUsuarios } from '../repository/usuarios/usuarios.js';
import { Usuarios } from '../repository/usuarios/usuarios.js';
import { TutoresSinUsuario } from '../repository/usuarios/usuarios.js';
import { UsuariosCrear } from '../repository/usuarios/usuarios.js';
import { UsuariosCrearEnMasa } from '../repository/usuarios/usuarios.js';


class UsuarioService {

    //Lista los datos de los tipos de usuarios
    async TipoUsuarios() {
            const lista = await TipoUsuarios()
            return lista
    }

    //Lista los datos de los usuarios
    async Usuarios(busqueda, identidadeducativa) {
            const lista = await Usuarios(busqueda, identidadeducativa)
            return lista
    }


    //Lista los datos de los tutores sin usuarios
    async TutoresSinUsuario(busqueda, identidadeducativa) {
            const lista = await TutoresSinUsuario(busqueda, identidadeducativa)
            return lista
    }

   //Crear Usuarios
    async UsuariosCrear(objeto) {
        try {
            const lista = await UsuariosCrear(objeto)
            return lista
        } catch (error) {
          console.error("Error en UsuarioService.UsuariosCrear:", error);
          throw error; // 👈 OBLIGATORIO: Volver a lanzar el error para que llegue al controlador
   9  }

    }

   //Crear Usuarios
    async UsuariosCrearEnMasa(objeto) {
            const lista = await UsuariosCrearEnMasa(objeto)
            return lista
    }

}


export const usuarioService = new UsuarioService()