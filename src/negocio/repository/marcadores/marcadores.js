import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarMarcadores() {
        try {
          const resul = await pg.getMarcadores()
          console.log(resul)
          return resul
        } catch (error) {
            return error
        }       
    }
    