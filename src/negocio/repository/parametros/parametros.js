import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function parametros(id) {
        try {
          const resul = await pg.parametros(id)
          return resul
        } catch (error) {
            return error
        }       
    }
    