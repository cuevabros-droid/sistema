//import { pgDatabase } from '../db/pgClient.js';
import {pool} from '../../daos/db/pgClient.js'
import { format } from 'date-fns';


class ContainerPg{
 

   
    //ACTUALIZA DATOS DE UNA PERSONA 
    async updatePersons(objeto, id){
        try {
            await pool.query('BEGIN'); 
            const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const objetoBuscado = (await pool.query(`update persona set apellidos = $2, nombres = $3, fecha_nacimiento = $4, id_localidad_nacimiento = $5, id_localidad_residencia = $6, id_nacionalidad = $7, correo_electronico = $8, activo = $9, es_alumno = $10, usuario = $11, recibe_notif_x_correo = $12, telefono = $13, fecha_ultima_modificacion = $14, usuario_ultima_modificacion = $15 where id_persona=$1`, [id, objeto.apellidos, objeto.nombres, objeto.fecha_nacimiento, objeto.id_localidad_nacimiento, objeto.id_localidad_residencia, objeto.id_nacionalidad, objeto.correo_electronico, objeto.activo, objeto.es_alumno, objeto.usuario, objeto.recibe_notif_x_correo, objeto.telefono, fechaActual, objeto.usuario_sistema ]))
            const objetoBuscado2 = (await pool.query(`update persona_sexo set id_sexo = $2, usuario_ultima_modificacion = $3, fecha_ultima_modificacion = $4 where id_persona=$1`, [id, objeto.id_sexo, objeto.usuario_sistema, fechaActual]))
            await pool.query('COMMIT'); 
            return objetoBuscado, objetoBuscado2;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
    }

        //ACTUALIZA EL ESTADO DE UNA PERSONA (ELIMINA) 
    async updatePersonsEstado(objeto){
        try {
            await pool.query('BEGIN'); 
            const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const objetoBuscado = (await pool.query(`update persona set activo = $2, fecha_ultima_modificacion = $3, usuario_ultima_modificacion = $4 where id_persona=$1`, [objeto.id, 'B', fechaActual, objeto.usuario_sistema]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
    }

        async getAll(){
        try {
            const objetoBuscado = (await pool.query(`select * from persona  where activo <> 'B' order by apellidos, nombres`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

        async getAllById(id){
        try {
            const objetoBuscado = (await pool.query(`select persona.*, persona_sexo.id_sexo from persona, persona_sexo where persona.id_persona = persona_sexo.id_persona and persona.id_persona=$1`, [id]))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }
 
        async getAllByApellidos(apellido){
        const apellidosconcomodin = `${apellido}%`

        try {

            const objetoBuscado = (await pool.query(`select * from persona where activo <> 'B' and apellidos ILIKE $1`, [apellidosconcomodin]))   
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

    async getLocalidades(){
        try {
            const objetoBuscado = (await pool.query(`select * from localidad`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

        async getDesercion(){
        try {
            const objetoBuscado = (await pool.query(`select * from motivo_desercion`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }
    
        async getNacionalidades(){
        try {
            const objetoBuscado = (await pool.query(`select * from nacionalidad`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

      async getDocumentos(){
        try {
            const objetoBuscado = (await pool.query(`select * from tipo_documento order by jerarquia`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

     
    async getDocumentosPersona(id){
        try {
            const objetoBuscado = (await pool.query(`select * from persona_tipo_documento where id_persona = $1`, [id]))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

    async actualizarDocumentoPersona(objeto){
        try {
            await pool.query('BEGIN'); 
            const objetoBuscado = (await pool.query(`update persona_tipo_documento set id_tipo_documento = $2, numero = $3, activo = $4 where id_persona_tipo_documento=$1`, [objeto.id_persona_tipo_documento, objeto.id_tipo_documento, objeto.numero, objeto.activo]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

    async eliminarDocumentoPersona(id){
        try {
            await pool.query('BEGIN'); 
            const objetoBuscado = (await pool.query(`delete from persona_tipo_documento where id_persona_tipo_documento=$1`, [id]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

    async registrarDocumentoPersona(objeto){

        // Formato estándar de base de datos sin offset de zona horaria
        const fecha_alta = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // Resultado: "2026-05-25 14:20:00"
    
        const query = `
        INSERT INTO persona_tipo_documento (
            id_persona, id_tipo_documento, numero, activo, 
            fecha_alta, usuario_alta
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;

       const valores = [
        objeto.id_persona, 
        objeto.id_tipo_documento, 
        objeto.numero, 
        objeto.activo, 
        fecha_alta,  //LOCALTIMESTAMP,                  // Fecha alta
        objeto.usuario_sistema              // Usuario alta
       ];


        try {
            await pool.query('BEGIN'); 
            const resultado = await pool.query(query, valores); 
            await pool.query('COMMIT'); 
            return resultado.rows;

        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

        //ALTA
    async createPerson(objeto){
        // Formato estándar de base de datos sin offset de zona horaria
        const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // Resultado: "2026-05-25 14:20:00"
    
        const query = `
        INSERT INTO persona (
            apellidos, nombres, fecha_nacimiento, id_localidad_nacimiento, 
            id_localidad_residencia, id_nacionalidad, correo_electronico, activo, 
            es_alumno, usuario, recibe_notif_x_correo, telefono, 
            fecha_alta, usuario_alta, fecha_ultima_modificacion, usuario_ultima_modificacion
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
        `;

        const querysexo = `
        INSERT INTO persona_sexo (
            id_persona, id_sexo, activo, 
            fecha_alta, usuario_alta, fecha_ultima_modificacion, usuario_ultima_modificacion
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `;

        
        const valores = [
        objeto.apellidos, 
        objeto.nombres, 
        objeto.fecha_nacimiento, 
        parseInt(objeto.id_localidad_nacimiento), 
        parseInt(objeto.id_localidad_residencia), 
        parseInt(objeto.id_nacionalidad), 
        objeto.correo_electronico, 
        objeto.activo, 
        objeto.es_alumno, 
        objeto.usuario, 
        objeto.recibe_notif_x_correo, 
        objeto.telefono, 
        fechaActual,  //LOCALTIMESTAMP,                  // Fecha alta
        objeto.usuario_sistema,              // Usuario alta
        fechaActual, //LOCALTIMESTAMP,                  // Fecha modif
        objeto.usuario_sistema               // Usuario modif
        ];

try {
    console.log("Intentando ejecutar la consulta con los valores:", valores);
    
    await pool.query('BEGIN'); 
    
    // 1. Insertar la persona
    const resultado = await pool.query(query, valores); 
    const personaCreada = resultado.rows[0]; // Aquí está el id_persona generado

    // 2. Preparar valores e insertar el sexo usando el id recién obtenido
    const valoressexo = [
        personaCreada.id_persona, // 🌟 Id correcto obtenido del RETURNING *
        objeto.id_sexo, 
        'S', 
        fechaActual,
        objeto.usuario_sistema,
        fechaActual,
        objeto.usuario_sistema 
    ];

    const resultadosexo = await pool.query(querysexo, valoressexo); 
    
    await pool.query('COMMIT'); 

    console.log("Datos que Postgres dice haber guardado:", personaCreada);
    
    // 🌟 CORREGIDO: Devolvemos la fila completa de la persona. 
    // Al llevar 'id_persona', el frontend lo leerá automáticamente.
    return personaCreada; 

} catch (error) {
    await pool.query('ROLLBACK'); 
    console.error("❌ Error al insertar en Postgres:", error);
    throw error; 
}

   }  

}  


 export {ContainerPg} ;
