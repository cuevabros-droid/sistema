import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarNacionalidades() {
        try {
          const resul = await pg.getNacionalidades()
          return resul
        } catch (error) {
            return error
        }       
    }
    