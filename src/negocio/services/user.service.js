import Usuario from '../models/user.js'
import { User } from '../repository/user/index.js';
import { createHash } from '../utils/bcrypt.js';
import nodemailer from '../../negocio/utils/nodemailer.js'
import {EMAILADMIN} from '../../config/config.js'


class UserService {

    
    //Da de alta un nuevo usuario
    async grabarUsuario(objeto) {
        try {
            objeto.password = createHash(objeto.password)
            const user = new Usuario(objeto);
            const registroUser = await User.grabarUsuario(user)            
            
            //Envio correo al administrador con los datos del usuario dado de alta
            const html = `<h1 style="color: blue;">Datos del Usuario creado: </h1> <strong>Usuario: </strong> ${user.email} <br> <strong>Contraseña: </strong> ${user.password} <br> <strong>Nombre: </strong> ${user.name} <br> <strong>Apellido: </strong> ${user.lastname} <br> <img width="70px" src=${user.image} alt="Foto"<br>`
            await nodemailer("Mailer", EMAILADMIN, "nuevo registro", html, null)

            return registroUser  
        } catch (error) {
            return error
        }
    }


    //Busco el usuario por email, para cuando se registra un nuevo usuario asegurarme ya no exista
    async buscar_usuario(user) {
        try {
           const usuarioBuscado = await User.buscar_usuario(user)

           if(usuarioBuscado) {
            return usuarioBuscado.datos()
           } else
            return null
        } catch (error) {
            return error
        }
    }


    //Muestra los datos del usuario logueado
    async usuarioInfo(user) {
           const usuarioBuscado = await User.usuarioInfo(user)

           if(usuarioBuscado) {
            return usuarioBuscado.datos()
           } else
            throw new Error("Usuario no encontrado")

    }

   
}

export const userService = new UserService()