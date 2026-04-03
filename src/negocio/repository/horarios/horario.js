import Horario from '../../models/horario.js'
//import pkg from 'pg'
//const { Pool } = pkg;
import {pool} from '../../../daos/db/pgClient.js'
//import {pool} from '../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarHorario() {
        try {
          const resul = await pg.getAllHorarios()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarHorarioconfiltro(texto) {
        try {
            console.log("Entro222")

          const resul = await pg.getHorariosFiltro(texto)
          console.log(resul)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function listarHorarioconid(id) {
        try {
          const resul = await pg.getHorariosById(id)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function grabarHorario(horario) {
      try {
          const resul = await pg.save(horario)
          return resul
      } catch(error) {
          return error
      }
  }

  
 export async function actualizarHorario(horario) {
    try {
        const resul = await pg.update(horario.datos())
        return resul
    } catch(error) {
        return error
    }
}


export async function eliminarHorario(id) {
    try {
        const resul = await pg.deleteById(id)
        return resul
    } catch(error) {
        return error
    }
}









