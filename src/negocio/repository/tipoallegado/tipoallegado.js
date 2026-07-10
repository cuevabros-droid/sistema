import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarTipoallegado() {
        try {
          const resul = await pg.getTiposAllegado()
          return resul
        } catch (error) {
            return error
        }       
    }
    