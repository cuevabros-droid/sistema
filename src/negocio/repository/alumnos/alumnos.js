//import Alumnos from '../../models/alumnos.js'
import {pool} from '../../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarAlumnos() {
        try {
          const resul = await pg.getAll()
          return resul
        } catch (error) {
            return error
        }    
       }   
          

    export async function listarAlumnosConFiltro(texto, id_establecimiento) {
      try {
        const resul = await pg.getAllAlumnosById(texto, id_establecimiento)
        if (resul ==  []){
          return null
        }
        else 
        return resul
      } catch (error) {
          return error
      }     
     }  
     
     
      export async function listarAlumnosConFiltroApellido(apellido) {
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

    export async function updateAlumnos(objeto) {
      try {

        const resul = await pg.updateAlumnos(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


  export async function updateAlumnosEstado(objeto) {

        try {

        const resul = await pg.updateAlumnosEstado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

// ✅ ASÍ DEBE QUEDAR EN: repository/personas/person.js
export async function AlumnosCreate(objeto) {
    try {
        const resul = await pg.createAlumno(objeto);

        // Si es un array y está vacío, o si no viene nada
        if (Array.isArray(resul) && resul.length === 0) {
            return null;
        } else {
            return resul;
        }
    } catch (error) {
        return error;
    }       
}



