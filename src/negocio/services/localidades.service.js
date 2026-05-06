//import Horario from '../models/horario.js'
import { listarLocalidades } from '../repository/localidades/localidades.js';


class LocalidadesService {

    //Lista los datos de todos los productos
    async listarLocalidades() {
            const lista = await listarLocalidades()
            return lista
    }

}

export const localidadesService = new LocalidadesService()