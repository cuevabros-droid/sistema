import Personas from '../models/person.js'
import { listarPersona } from '../repository/personas/person.js';
import { listarPersonsConFiltro } from '../repository/personas/person.js';
import { listarPersonsConFiltroApellido } from '../repository/personas/person.js';
import { updatePersons } from '../repository/personas/person.js';


class PersontService {


    //Agrega un producto nuevo
    async grabarProducto(objeto) {
        try {
            const product = new Productos(objeto);
            const registroProduct = await persona.grabarProducto(person)
            return registroProduct  
        } catch (error) {
            return error
        }
    }


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

    //Actualiza los datos de un producto dado
    async updatePersons(objeto, id) {
        try {
          updatePerson = await updatePersons(objeto, id)
            return updatePerson  
        } catch (error) {
            return error
        }
    } 
    

    //Elimina un producto dado
    async eliminarProducto(id) {
        try {
            const deleteProduct = await Personas.eliminarProducto(id)
            return deleteProduct  
        } catch (error) {
            return error
        }
    }


    //Lista los datos de un producto dado
    async listarProductoPorId(id) {
        try {
            const producto = await Personas.listarProductoPorId(id)
            if(producto)
             return producto.datos()
            else 
             return null
        } catch (error) {
            return error
        }
    }

}

export const persontService = new PersontService()