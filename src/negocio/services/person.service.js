import Personas from '../models/person.js'
import { listarPersona } from '../repository/personas/person.js';
import { listarPersonsConFiltro } from '../repository/personas/person.js';
import { Apellido } from '../repository/personas/person.js';


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
      //      console.log(listadoPersonas)
            return listadoPersonas


      /*      if(listadoPersonas){
                const personas = []
                listadoPersonas.forEach(d => {
                    personas.push(d.datos())
                  //  console.log(d.datos())

            });
                return personas
            } else
                return null

        } catch (error) {
            return error*/
        }

    

    async  listarPersonsConFiltro(texto) {
        const listadoPersonas = await listarPersonsConFiltro(texto)
        return listadoPersonas

     /*   if(listadoPersonas){
            const personas = []
            listadoPersonas.forEach(d => {
                personas.push(d.datos())
        });
            return personas
        } else
            return null

    } catch (error) {
        return error*/
    }

    async  Apellido(apellido) {
        const listadoApellido = await Apellido(apellido)
        console.log(listadoApellido)
        return listadoApellido

     /*   if(listadoPersonas){
            const personas = []
            listadoPersonas.forEach(d => {
                personas.push(d.datos())
        });
            return personas
        } else
            return null

    } catch (error) {
        return error*/
    }

    //Actualiza los datos de un producto dado
    async actualizarProducto(objeto) {
        try {
            const product = new Productos(objeto);
            const updateProduct = await Personas.actualizarProducto(product)
            return updateProduct  
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