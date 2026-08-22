import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarDesercion() {
        try {
          const resul = await pg.getDesercion()
          return resul
        } catch (error) {
            return error
        }       
    }
    