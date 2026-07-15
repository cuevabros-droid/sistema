import Personas from '../../models/person.js'
import {pool} from '../../../daos/db/pgClient.js'
import  {ContainerPg}  from '../../../daos/container/containerPg.js'


const pg = new ContainerPg

    export async function listarPersona() {
        try {
          const resul = await pg.getAll()
          return resul
        } catch (error) {
            return error
        }    
       }   
          

    export async function listarPersonsConFiltro(texto) {
      try {
        const resul = await pg.getAllById(texto)
        if (resul ==  []){
          return null
        }
        else 
        return resul
      } catch (error) {
          return error
      }     
     }  
     
     
  export async function listarPersonsConFiltroApellido(apellido) {
      try {
        const resul = await pg.getAllByApellidos(apellido)
        if (resul ==  []){
          return null
        }
   
        else 
        return resul
      } catch (error) {
          return error
      }       
  }

    export async function updatePersons(objeto, id) {
      try {

        const resul = await pg.updatePersons(objeto, id)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }


  export async function updatePersonsEstado(objeto) {

        try {

        const resul = await pg.updatePersonsEstado(objeto)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }

// ✅ ASÍ DEBE QUEDAR EN: repository/personas/person.js
export async function PersonsCreate(objeto) {
    try {
        const resul = await pg.createPerson(objeto);

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

export async function listarSaldoAlumnoPorId(id) {
  try {
    const resul = await pg.getSaldosPorAlumno(id);''
    if (resul == []) {
      return null;
    } else return resul;
  } catch (error) {
    return error;
  }
}

export async function listarAlumnosPorUsuario(usuario) {
  try {
    const resul = await pg.getAlumnosPorUsuario(usuario);
    if (resul == []) {
      return null;
    } else return resul;
  } catch (error) {
    return error;
  }
}

export async function listarAlumnosPorId(id) {
  try {
    const resul = await pg.getAlumnosPorId(id);
 if (!resul || resul.length === 0) {      return null;
    } else return resul;
  } catch (error) {
    throw error;
  }
}

export async function listarTutoresPorId(id) {
  try {
    const resul = await pg.getTutoresPorId(id);
 if (!resul || resul.length === 0) {      
     return null;
    } else return resul;
  } catch (error) {
    throw error;
  }
}


  export async function listarPersonsConFiltroApellidoDocumento(apellidodocumento) {
      try {
        const resul = await pg.getAllByApellidosDocumento(apellidodocumento)
        if (resul ==  []){
          return null
        }
   
        else 
        return resul
      } catch (error) {
          return error
      }       
  }

export async function PersonaAllegadaCreate(objeto) {
    try {
        const resul = await pg.createPersonaAllegada(objeto);

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


    export async function eliminarAllegado(id) {
        try {
          const resul = await pg.eliminarAllegado(id)
          return resul
        } catch (error) {
            return error
        }       
    }

    export async function updatePersonaAllegada(objeto, id) {
      try {

        const resul = await pg.updatePersonaAllegada(objeto, id)

        if (resul ==  []){
          return null
        } else 
          return resul
      } catch (error) {
          return error
      }       
  }
