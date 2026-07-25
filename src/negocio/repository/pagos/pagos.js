import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarMedios() {
        try {
          const resul = await pg.getMedios()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarMarcas() {
        try {
          const resul = await pg.getMarcas()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarEntidades() {
        try {
          const resul = await pg.getEntidades()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listado(id, id_establecimiento) {
        try {
          const resul = await pg.getListadoPagos(id, id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }


export async function createPago(objeto) {

    try {
        const resul = await pg.createPago(objeto);

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


    export async function deletePago(id) {
        try {
          const resul = await pg.deletePago(id)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function updatePago(objeto) {
      try {

        const resul = await pg.updatePago(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }
