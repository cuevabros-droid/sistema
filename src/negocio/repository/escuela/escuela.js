import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarEscuela(id) {
        try {
          const resul = await pg.getEscuela(id)
          return resul
        } catch (error) {
            return error
        }       
    }
    