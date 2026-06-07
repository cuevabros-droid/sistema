//import Horario from '../models/horario.js'
import { listarDocumentos } from '../repository/documentos/documentos.js';


class DocumentosService {

    //Lista los datos de todos los productos
    async listarDocumentos() {
            const lista = await listarDocumentos()
            return lista
    }

}

export const documentosService = new DocumentosService()