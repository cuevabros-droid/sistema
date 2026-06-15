//import Horario from '../models/horario.js'
import { listarDocumentos } from '../repository/documentos/documentos.js';
import { listarDocumentosPersona } from '../repository/documentos/documentos.js';
import { registrarDocumentoPersona } from '../repository/documentos/documentos.js';
import { actualizarDocumentoPersona } from '../repository/documentos/documentos.js';
import { eliminarDocumentoPersona } from '../repository/documentos/documentos.js';


class DocumentosService {

    //Lista los datos de todos los productos
    async listarDocumentos() {
            const lista = await listarDocumentos()
            return lista
    }


            //Lista los datos de todos los documentos
    async listarDocumentosPersona(id) {
            const registro = await listarDocumentosPersona(id)
            return registro
    }

        //Graba los datos del documento de la persona
    async registrarDocumentoPersona(objeto) {
            const registro = await registrarDocumentoPersona(objeto)
            return registro
    }

    //Actualiza documento persona
    async actualizarDocumentoPersona(objeto) {
            const registro = await actualizarDocumentoPersona(objeto)
            return registro
    }

    //Actualiza documento persona
    async eliminarDocumentoPersona(id) {
            const registro = await eliminarDocumentoPersona(id)
            return registro
    }

}

export const documentosService = new DocumentosService()