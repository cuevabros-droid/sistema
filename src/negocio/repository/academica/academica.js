import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarGrado(id_establecimiento) {
        try {
          const resul = await pg.getGrado(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarDivision(id_establecimiento) {
        try {
          const resul = await pg.getDivision(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarAnioCursado() {
        try {
          const resul = await pg.getAnioCursado()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listado(id, id_establecimiento) {
        try {
          const resul = await pg.getListado(id, id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }


export async function createAcademica(objeto) {
    try {
        const resul = await pg.createAcademica(objeto);

        // Si es un array y está vacío, o si no viene nada
        if (Array.isArray(resul) && resul.length === 0) {
            return null;
        } else {
            return resul;
        }
    } catch (error) {
        return error;
    }       
}


    export async function deleteAcademica(id) {
        try {
          const resul = await pg.deleteAcademica(id)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function updateAcademica(objeto) {
      try {

        const resul = await pg.updateAcademica(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }
