import Horario from '../models/horario.js'
import { grabarHorario, listarHorario, listarHorarioconfiltro, listarHorarioconid, eliminarHorario } from '../repository/horarios/horario.js';


class HorarioService {


    //Agrega un producto nuevo
    async grabarHorario(objeto) {
        try {
            const horario = new Horario(objeto);
            const registroHorario = await grabarHorario(horario)
            return registroHorario  
        } catch (error) {
            return error
        }
    }


    //Lista los datos de todos los productos
    async listarHorario() {
            const listadoHorario = await listarHorario()
            return listadoHorario
    }

        //Lista los datos de todos los productos
     async listarHorarioconfiltro(texto) {
            const listadoHorario = await listarHorarioconfiltro(texto)
            return listadoHorario
    }


    async listarHorarioconid(id) {
        const listadoHorario = await listarHorarioconid(id)
        return listadoHorario
    }

    //Actualiza los datos de un producto dado
    async actualizarHorario(objeto) {
        try {
            const horario = new Horario(objeto);
            const updateHorario = await horario.actualizarHorario(horario)
            return updateHorario  
        } catch (error) {
            return error
        }
    }
    

    //Elimina un producto dado
    async eliminarHorario(id) {
        try {
            const deleteHorario = await eliminarHorario(id)
            return deleteHorario  
        } catch (error) {
            return error
        }
    }


}

export const horarioService = new HorarioService()