//import Horario from '../models/horario.js'
import { listarTipoallegado } from '../repository/tipoallegado/tipoallegado.js';


class TipoAllegadoService {

    //Lista los datos de todos los productos
    async listarTipoallegado() {
            const lista = await listarTipoallegado()
            return lista
    }

}

export const tipoallegadoService = new TipoAllegadoService()