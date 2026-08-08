//import Horario from '../models/horario.js'
import { listarMarcadores } from '../repository/marcadores/marcadores.js';


class MarcadoresService {

    //Lista los datos de todos los productos
    async listarMarcadores() {
            const lista = await listarMarcadores()
            return lista
    }

}

export const marcadoresService = new MarcadoresService()