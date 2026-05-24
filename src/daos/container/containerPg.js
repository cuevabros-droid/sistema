//import { pgDatabase } from '../db/pgClient.js';
import {pool} from '../../daos/db/pgClient.js'


class ContainerPg{

    //ALTA
    async save(objeto){
 
        try {
            await pool.query(`insert into franja_horaria values($1, $2)`, [objeto.id, objeto.detalle])
            return objeto
        } 
        catch (error){
            return error
        } 
      }
   

    //BAJA 
    async deleteById(id){

        try {
            const objetoBuscado = (await pool.query(`delete from franja_horaria where id_franja_horaria=$1`, [id]))

            if (objetoBuscado===undefined) {
                return null
            } else {
                return objetoBuscado;
            }
            
        }

        catch(error){
            return error
        } 

    }

    
    //MODICICACIÓN 
    async updatePersons(objeto, id){
        try {
            const objetoBuscado = (await pool.query(`update persona set apellidos = $2, nombres = $3, fecha_nacimiento = $4, id_localidad_nacimiento = $5, id_localidad_residencia = $6, id_nacionalidad = $7, correo_electronico = $8, activo = $9, es_alumno = $10, usuario = $11, recibe_notif_x_correo = $12, telefono = $13 where id_persona=$1`, [id, objeto.apellidos, objeto.nombres, objeto.fecha_nacimiento, objeto.id_localidad_nacimiento, objeto.id_localidad_residencia, objeto.id_nacionalidad, objeto.correo_electronico, objeto.activo, objeto.es_alumno, objeto.usuario, objeto.recibe_notif_x_correo, objeto.telefono ]))
            const objetoBuscado2 = (await pool.query(`update persona_sexo set id_sexo = $2 where id_persona=$1`, [id, objeto.id_sexo]))
            return objetoBuscado, objetoBuscado2;
        }
        catch(error){
            return error
        } 
    }

        async getAll(){
        try {
            const objetoBuscado = (await pool.query(`select * from persona order by apellidos, nombres`))
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

            const objetoBuscado = (await pool.query(`select * from persona where activo = 'S' and apellidos ILIKE $1`, [apellidosconcomodin]))   
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

 }



 export {ContainerPg} ;
