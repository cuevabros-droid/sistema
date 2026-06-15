import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarDocumentos() {
        try {
          const resul = await pg.getDocumentos()
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listarDocumentosPersona(id) {
        try {
          const resul = await pg.getDocumentosPersona(id)
          return resul
        } catch (error) {
            return error
        }       
    }

    
    export async function registrarDocumentoPersona(objeto) {
        try {
          const resul = await pg.registrarDocumentoPersona(objeto)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function actualizarDocumentoPersona(objeto) {
        try {
          const resul = await pg.actualizarDocumentoPersona(objeto)
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function eliminarDocumentoPersona(id) {
        try {
          const resul = await pg.eliminarDocumentoPersona(id)
          return resul
        } catch (error) {
            return error
        }       
    }