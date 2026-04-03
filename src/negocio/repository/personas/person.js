import Personas from '../../models/person.js'
//import pkg from 'pg'
//const { Pool } = pkg;
import {pool} from '../../../daos/db/pgClient.js'
//import {pool} from '../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarPersona() {
        try {
          const resul = await pg.getAll()
      //    const resul = dtos.map(dto => new Personas(dto))
          //console.log(dtos)
          return resul
        } catch (error) {
            return error
        }    
        
        
    }

    

    export async function listarPersonsConFiltro(texto) {
      try {
        const resul = await pg.getAllConFiltro(texto)
        if (resul ==  []){
          return null
        }
   
        else 
        return resul
      } catch (error) {
          return error
      }       
  }






