import { listarGrado } from '../repository/academica/academica.js';
import { crearGrado } from '../repository/academica/academica.js';
import { updateGrado } from '../repository/academica/academica.js';
import { deleteGrado } from '../repository/academica/academica.js';
import { listarNivel } from '../repository/academica/academica.js';
import { crearNivel } from '../repository/academica/academica.js';
import { updateNivel } from '../repository/academica/academica.js';
import { deleteNivel } from '../repository/academica/academica.js';
import { listarDivision } from '../repository/academica/academica.js';
import { crearDivision } from '../repository/academica/academica.js';
import { updateDivision } from '../repository/academica/academica.js';
import { deleteDivision } from '../repository/academica/academica.js';
import { listarAnioCursado } from '../repository/academica/academica.js';
import { crearAnioCursado } from '../repository/academica/academica.js';
import { updateAnioCursado } from '../repository/academica/academica.js';
import { deleteAnioCursado } from '../repository/academica/academica.js';
import { listado } from '../repository/academica/academica.js';
import { createAcademica } from '../repository/academica/academica.js';
import { updateAcademica } from '../repository/academica/academica.js';
import { deleteAcademica } from '../repository/academica/academica.js';


class AcademicaService {

    async listarGrado(id_establecimiento) {
            const lista = await listarGrado(id_establecimiento)
            return lista
    }


    async crearGrado(body) {
            const lista = await crearGrado(body)
            return lista
    }


    async updateGrado(objeto) {
            try {
              const lista = await updateGrado(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async deleteGrado(objeto) {
            try {
              const lista = await deleteGrado(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async listarNivel(id_establecimiento) {
            const lista = await listarNivel(id_establecimiento)
            return lista
    }

    async crearNivel(body) {
            const lista = await crearNivel(body)
            return lista
    }


    async updateNivel(objeto) {
            try {
              const lista = await updateNivel(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async deleteNivel(objeto) {
            try {
              const lista = await deleteNivel(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 
    


    async crearDivision(body) {
            const lista = await crearDivision(body)
            return lista
    }


    async updateDivision(objeto) {
            try {
              const lista = await updateDivision(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async deleteDivision(objeto) {
            try {
              const lista = await deleteDivision(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async listarDivision(id_establecimiento) {
            const lista = await listarDivision(id_establecimiento)
            return lista
    }

    async listarAnioCursado(id_establecimiento) {
            const lista = await listarAnioCursado(id_establecimiento)
            return lista
    }


    async crearAnioCursado(body) {
            const lista = await crearAnioCursado(body)
            return lista
    }


    async updateAnioCursado(objeto) {
            try {
              const lista = await updateAnioCursado(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 

    async deleteAnioCursado(objeto) {
            try {
              const lista = await deleteAnioCursado(objeto)
                return lista  
            } catch (error) {
                throw error
            }
    } 


    async listado(id, id_establecimiento) {
            const lista = await listado(id, id_establecimiento)
            return lista
    }

    async updateAcademica(objeto) {
            try {
              const updatePerson = await updateAcademica(objeto)
                return updatePerson  
            } catch (error) {
                throw error
            }
        } 
    
        async createAcademica(objeto) {
            try {
              const createPerson = await createAcademica(objeto)
                return createPerson  
            } catch (error) {
                throw error
            }
        } 

        async deleteAcademica(objeto) {
            try {
              const createPerson = await deleteAcademica(objeto)
                return createPerson  
            } catch (error) {
                throw error
            }
        } 

}

export const academicaService = new AcademicaService()