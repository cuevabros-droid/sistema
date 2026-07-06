import Alumnos from '../models/alumnos.js'
import { listarAlumnos } from '../repository/alumnos/alumnos.js';
import { listarAlumnosConFiltro } from '../repository/alumnos/alumnos.js';
import { listarAlumnosConFiltroApellido } from '../repository/alumnos/alumnos.js';
import { updateAlumnos } from '../repository/alumnos/alumnos.js';
import { updateAlumnosEstado } from '../repository/alumnos/alumnos.js';
import { AlumnosCreate } from '../repository/alumnos/alumnos.js';


class AlumnosService {


    //Lista los datos de todos los productos
    async listarAlumnos() {
            const listadoPersonas = await listarAlumnos()
            return listadoPersonas
        }

    

    async  listarAlumnosConFiltro(texto, id_establecimiento) {
        const listadoPersonas = await listarAlumnosConFiltro(texto, id_establecimiento)
        return listadoPersonas

    }

    async  listarAlumnosConFiltroApellido(apellido) {
        const listadoApellido = await listarAlumnosConFiltroApellido(apellido)
        return listadoApellido

    }

    //Actualiza los datos de una Persona dada
    async updateAlumnos(objeto) {
        try {
          updatePerson = await updateAlumnos(objeto)
            return updatePerson  
        } catch (error) {
            return error
        }
    } 
    
        //Actualiza el Estado de una Persona dada
    async updateAlumnosEstado(objeto) {
        try {
          updatePerson = await updateAlumnosEstado(objeto)
            return updatePerson  
        } catch (error) {
            return error
        }
    } 

        async AlumnosCreate(objeto) {
        try {
          const createPerson = await AlumnosCreate(objeto)
            return createPerson  
        } catch (error) {
            return error
        }
    } 

}

export const alumnosService = new AlumnosService()