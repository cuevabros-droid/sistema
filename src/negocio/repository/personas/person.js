import Personas from '../../models/person.js'
import {pool} from '../../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarPersona() {
        try {
          const resul = await pg.getAll()
          return resul
        } catch (error) {
            return error
        }    
       }   
          

    export async function listarPersonsConFiltro(texto) {
      try {
        const resul = await pg.getAllById(texto)
        if (resul ==  []){
          return null
        }
        else 
        return resul
      } catch (error) {
          return error
      }     
     }  
     
     
      export async function listarPersonsConFiltroApellido(apellido) {
      try {
        const resul = await pg.getAllByApellidos(apellido)
        if (resul ==  []){
          return null
        }
   
        else 
        return resul
      } catch (error) {
          return error
      }       
  }

    export async function updatePersons(objeto, id) {
      try {

        const resul = await pg.updatePersons(objeto, id)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


  export async function updatePersonsEstado(objeto) {

        try {

        const resul = await pg.updatePersonsEstado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

   export async function PersonsCreate(objeto) {

        try {

        const resul = await pg.createPerson(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }



