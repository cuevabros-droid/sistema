import Personas from '../models/person.js'
import { listarPersona } from '../repository/personas/person.js';
import { listarPersonsConFiltro } from '../repository/personas/person.js';
import { listarPersonsConFiltroApellido } from '../repository/personas/person.js';
import { listarSaldoAlumnoPorId } from '../repository/personas/person.js';
import { listarAlumnosPorUsuario } from '../repository/personas/person.js';
import { listarAlumnosPorId } from '../repository/personas/person.js';
import { listarTutoresPorId } from '../repository/personas/person.js';
import { updatePersons } from '../repository/personas/person.js';
import { updatePersonsEstado } from '../repository/personas/person.js';
import { PersonsCreate } from '../repository/personas/person.js';
import { PersonaAllegadaCreate } from '../repository/personas/person.js';
import { eliminarAllegado } from '../repository/personas/person.js';
import { listarPersonsConFiltroApellidoDocumento } from '../repository/personas/person.js';
import { updatePersonaAllegada } from '../repository/personas/person.js';



class PersontService {


    //Lista los datos de todos los productos
    async listarPersonas(filtro) {

            const listadoPersonas = await listarPersona(filtro)
            return listadoPersonas
        }

    

    async  listarPersonsConFiltro(texto) {
        const listadoPersonas = await listarPersonsConFiltro(texto)
        return listadoPersonas

    }

    async  listarPersonsConFiltroApellido(apellido) {
        const listadoApellido = await listarPersonsConFiltroApellido(apellido)
        return listadoApellido

    }

    //Actualiza los datos de una Persona dada
    async updatePersons(objeto, id) {
        try {
          updatePerson = await updatePersons(objeto, id)
            return updatePerson  
        } catch (error) {
            return error
        }
    } 
    
        //Actualiza el Estado de una Persona dada
    async updatePersonsEstado(objeto) {
        try {
          updatePerson = await updatePersonsEstado(objeto)
            return updatePerson  
        } catch (error) {
            return error
        }
    } 

        async PersonsCreate(objeto) {
        try {
          const createPerson = await PersonsCreate(objeto)
            return createPerson  
        } catch (error) {
            return error
        }
    } 

    async  listarSaldoAlumnoPorId(id) {
        const listadoSaldoAlumno = await listarSaldoAlumnoPorId(id)
        return listadoSaldoAlumno
    }

    
    async  listarAlumnosPorUsuario(usuario) {
        const listarAlumnos = await listarAlumnosPorUsuario(usuario)
        return listarAlumnos
    }

    async  listarAlumnosPorId(id, id_establecimiento) {
        const listarAlumnos = await listarAlumnosPorId(id, id_establecimiento)
        return listarAlumnos
    }

    async  listarTutoresPorId(id) {
        const listarAlumnos = await listarTutoresPorId(id)
        return listarAlumnos
    }


    async  listarPersonsConFiltroApellidoDocumento(apellidodocumento) {
        const listadoApellido = await listarPersonsConFiltroApellidoDocumento(apellidodocumento)
        return listadoApellido

    }

    async PersonaAllegadaCreate(objeto) {
        try {
          const createPersonaAllegada = await PersonaAllegadaCreate(objeto)
            return createPersonaAllegada  
        } catch (error) {
            console.error("Error en service PersonaAllegadaCreate:", error);
            throw error; // Re-lanza el error nativo sin re-instanciar objetos raros
        }
    } 

    //Elimina documento persona
    async eliminarAllegado(id) {
        const registro = await eliminarAllegado(id)
            return registro
    }


        //Actualiza los datos de una Persona dada
    async updatePersonaAllegada(body, id) {
        try {
          updatePersonaAllegada = await updatePersonaAllegada(body, id)
            return updatePersonaAllegada  
        } catch (error) {
            return error
        }
    } 

}

export const persontService = new PersontService()