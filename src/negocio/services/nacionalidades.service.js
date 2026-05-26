//import Horario from '../models/horario.js'
import { listarNacionalidades } from '../repository/nacionalidades/nacionalidades.js';


class NacionalidadesService {

    //Lista los datos de todos los productos
    async listarNacionalidades() {
            const lista = await listarNacionalidades()
            return lista
    }

}

export const nacionalidadesService = new NacionalidadesService()