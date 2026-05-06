import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarLocalidades() {
        try {
          const resul = await pg.getLocalidades()
          return resul
        } catch (error) {
            return error
        }       
    }
    