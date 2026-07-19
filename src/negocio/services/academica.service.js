import { listarGrado } from '../repository/academica/academica.js';
import { listarDivision } from '../repository/academica/academica.js';
import { listarAnioCursado } from '../repository/academica/academica.js';
import { listado } from '../repository/academica/academica.js';
import { createAcademica } from '../repository/academica/academica.js';
import { updateAcademica } from '../repository/academica/academica.js';
import { deleteAcademica } from '../repository/academica/academica.js';


class AcademicaService {

    async listarGrado(id_establecimiento) {
            const lista = await listarGrado(id_establecimiento)
            return lista
    }

    async listarDivision(id_establecimiento) {
            const lista = await listarDivision(id_establecimiento)
            return lista
    }

    async listarAnioCursado() {
            const lista = await listarAnioCursado()
            return lista
    }

    async listado(id, id_establecimiento) {
            const lista = await listado(id, id_establecimiento)
            return lista
    }

    async updateAcademica(objeto) {
            try {
              updatePerson = await updateAcademica(objeto)
                return updatePerson  
            } catch (error) {
                return error
            }
        } 
    
        async createAcademica(objeto) {
            try {
              const createPerson = await createAcademica(objeto)
                return createPerson  
            } catch (error) {
                return error
            }
        } 

        async deleteAcademica(objeto) {
            try {
              const createPerson = await deleteAcademica(objeto)
                return createPerson  
            } catch (error) {
                return error
            }
        } 

}

export const academicaService = new AcademicaService()