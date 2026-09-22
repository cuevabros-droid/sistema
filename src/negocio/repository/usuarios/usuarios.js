import {pool} from '../../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg


    export async function TipoUsuarios() {
        try {
          const resul = await pg.TipoUsuarios()
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function Usuarios(busqueda, identidadeducativa) {
        try {
          const resul = await pg.Usuarios(busqueda, identidadeducativa)
          return resul
        } catch (error) {
            return error
        }       
    }

        
    export async function TutoresSinUsuario(objeto, identidadeducativa) {
        try {
          const resul = await pg.TutoresSinUsuario(objeto, identidadeducativa)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function UsuariosCrear(objeto) {
        try {
          const resul = await pg.CrearUsuario(objeto)
          return resul
        } catch (error) {
          throw error; // 👈 OBLIGATORIO: Volver a lanzar el error para que llegue al controlador
        }       
    }


    export async function UsuariosCrearEnMasa(objeto) {
        
        try {
          const resul = await pg.CrearUsuarioEnMasa(objeto)
          return resul
        } catch (error) {
            return error
        }       
    }
  