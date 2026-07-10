import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarOcupacion() {
        try {
          const resul = await pg.getOcupaciones()
          return resul
        } catch (error) {
            return error
        }       
    }
    