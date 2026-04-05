//import { pgDatabase } from '../db/pgClient.js';
import {pool} from '../../daos/db/pgClient.js'


class ContainerPg{

 /*   coleccion;

    constructor(nombreColeccion) {
        this.coleccion = pgDatabase.collection(nombreColeccion);
    }*/

    
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


 
               //CONSULTA POR ID
            async getHorariosById(id){

                let objetoBuscado

       
                 //   if((await pool.query(`select count(*) from persona where apellidos like $1`, [apellido])) > 0) {
                        objetoBuscado = (await pool.query(`select id_franja_horaria, detalle from franja_horaria where id_franja_horaria = $1`, [id])).rows

                        if (objetoBuscado===undefined) {
                            return null
                        } else {
                            return objetoBuscado;
                        }
                                
                    }
        


            //CONSULTA CON FILTRO
            async getHorariosFiltro(detalle){
                console.log("parece que si")
                detalle = detalle + '%'
        
                          let objetoBuscado
        
                 //   if((await pool.query(`select count(*) from persona where apellidos like $1`, [apellido])) > 0) {
                      objetoBuscado = (await pool.query(`select id_franja_horaria, detalle from franja_horaria where detalle like $1`, [detalle])).rows
                      // objetoBuscado = (await pool.query(`select id_franja_horaria, detalle from franja_horaria`)).rows

                        console.log("acá esta la salidahoy")
                        console.log(objetoBuscado)
                        if (objetoBuscado===undefined) {
                            return null
                        } else {
                            return objetoBuscado;
                        }
                                
                    }
        
        

            //CONSULTA SIN FILTRO
            async getAllHorarios(){

                try {
        
                    const objetoBuscado = (await pool.query('select id_franja_horaria, detalle from franja_horaria order by id_franja_horaria')).rows
        //console.log(objetoBuscado)
        
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
        


    //BAJA 
    async deleteById(id){

        try {
            const objetoBuscado = (await pool.query(`delete from franja_horaria where id_franja_horaria=$1`, [id]))
//console.log(objetoBuscado)

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
    async update(objeto){
        try {
            const objetoBuscado = (await pool.query(`update franja_horaria set detalle = $2 where id_franja_horaria=$1`, [objeto.id, objeto.detalle]))
            return objetoBuscado;
        }
        catch(error){
            return error
        } 
    }

        async getAll(){
        try {
            const objetoBuscado = (await pool.query(`select * from persona order by apellidos, nombres`))
            //console.log(objetoBuscado.rows)
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

        async getAllById(id){
        try {
            const objetoBuscado = (await pool.query(`select * from persona where id_persona=$1`, [id]))
            console.log(id)
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }
 
        async getAllByApellidos(apellido){
        const apellidosconcomodin = `%${apellido}%`
        console.log(apellidosconcomodin)
        try {
            const objetoBuscado = (await pool.query(`select * from persona where apellidos LIKE $1`, [apellidosconcomodin]))
                    console.log(objetoBuscado.rows)

            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }


 }



 export {ContainerPg} ;
