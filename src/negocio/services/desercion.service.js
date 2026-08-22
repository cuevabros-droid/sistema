//import Horario from '../models/horario.js'
import { listarDesercion } from '../repository/desercion/desercion.js';


class DesercionService {

    //Lista los datos de todos los productos
    async listarDesercion() {
            const lista = await listarDesercion()
            return lista
    }

}

export const desercionService = new DesercionService()