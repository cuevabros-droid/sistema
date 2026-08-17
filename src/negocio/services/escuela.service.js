//import Horario from '../models/horario.js'
import { listarEscuela } from '../repository/escuela/escuela.js';


class EscuelaService {

    //Lista los datos de todos los productos
    async listarEscuela(id) {
            const lista = await listarEscuela(id)
            return lista
    }

}

export const escuelaService = new EscuelaService()