import Personas from '../models/person.js'
import { listarPersona } from '../repository/personas/person.js';
import { listarPersonsConFiltro } from '../repository/personas/person.js';
import { listarPersonsConFiltroApellido } from '../repository/personas/person.js';
import { updatePersons } from '../repository/personas/person.js';
import { updatePersonsEstado } from '../repository/personas/person.js';
import { PersonsCreate } from '../repository/personas/person.js';


class PersontService {


    //Lista los datos de todos los productos
    async listarPersonas() {
            const listadoPersonas = await listarPersona()
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
          createPerson = await PersonsCreate(objeto)
            return createPerson  
        } catch (error) {
            return error
        }
    } 

}

export const persontService = new PersontService()