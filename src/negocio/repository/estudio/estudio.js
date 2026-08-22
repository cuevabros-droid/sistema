import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarEstudio() {
        try {
          const resul = await pg.getEstudios()
          return resul
        } catch (error) {
            return error
        }       
    }
    