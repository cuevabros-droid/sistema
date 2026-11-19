import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarGrado(id_establecimiento) {
        try {
          const resul = await pg.getGrado(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function crearGrado(body) {
        try {
          const resul = await pg.crearGrado(body)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function updateGrado(objeto) {
      try {

        const resul = await pg.updateGrado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


      export async function deleteGrado(objeto) {
      try {

        const resul = await pg.deleteGrado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

    export async function listarNivel(id_establecimiento) {
        try {
          const resul = await pg.getNivel(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }
    

    export async function crearNivel(body) {
        try {
          const resul = await pg.crearNivel(body)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function updateNivel(objeto) {
      try {

        const resul = await pg.updateNivel(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


      export async function deleteNivel(objeto) {
      try {

        const resul = await pg.deleteNivel(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

    export async function listarDivision(id_establecimiento) {
        try {
          const resul = await pg.getDivision(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function crearDivision(body) {
        try {
          const resul = await pg.crearDivision(body)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function updateDivision(objeto) {
      try {

        const resul = await pg.updateDivision(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


      export async function deleteDivision(objeto) {
      try {

        const resul = await pg.deleteDivision(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }
    
    export async function listarAnioCursado(id_establecimiento) {
        try {
          const resul = await pg.getAnioCursado(id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }
    
    export async function listado(id, id_establecimiento) {
        try {
          const resul = await pg.getListado(id, id_establecimiento)
          return resul
        } catch (error) {
            return error
        }       
    }


export async function createAcademica(objeto) {
    try {
        const resul = await pg.createAcademica(objeto);

        // Si es un array y está vacío, o si no viene nada
        if (Array.isArray(resul) && resul.length === 0) {
            return null;
        } else {
            return resul;
        }
    } catch (error) {
        return error;
    }       
}


    export async function deleteAcademica(id) {
        try {
          const resul = await pg.deleteAcademica(id)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function updateAcademica(objeto) {
      try {

        const resul = await pg.updateAcademica(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


      export async function crearAnioCursado(body) {
        try {
          const resul = await pg.crearAnioCursado(body)
          return resul
        } catch (error) {
            return error
        }       
    }


    export async function updateAnioCursado(objeto) {
      try {

        const resul = await pg.updateAnioCursado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


      export async function deleteAnioCursado(objeto) {
      try {

        const resul = await pg.deleteAnioCursado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

