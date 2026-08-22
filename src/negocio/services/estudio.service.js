//import Horario from '../models/horario.js'
import { listarEstudio } from '../repository/estudio/estudio.js';


class EstudioService {

    //Lista los datos de todos los productos
    async listarEstudio() {
            const lista = await listarEstudio()
            return lista
    }

}

export const estudioService = new EstudioService()