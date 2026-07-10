//import Horario from '../models/horario.js'
import { listarOcupacion } from '../repository/ocupacion/ocupacion.js';


class OcupacionService {

    //Lista los datos de todos los productos
    async listarOcupacion() {
            const lista = await listarOcupacion()
            return lista
    }

}

export const ocupacionService = new OcupacionService()