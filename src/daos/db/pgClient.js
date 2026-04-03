//import { Pool } from 'pg';
import pkg from 'pg'
const { Pool } = pkg;
//import { Pool } from 'pg';

 export const pool = new Pool({
    user: 'postgres',
    host: '31.220.31.59',
    //host: 'localhost',
    database: 'gestion_escuelas',
    //database: 'quinta',
    password: 'toba123*-a_postgres',
    //password: 'postgres',
    port: 5432,
  })

  //await pool.connect()

  //export const pgDb = pool.database

  
 /* const getPersonas = async () => {
    console.log((await pool.query('select apellidos, nombres from persona')).rows);
  }

  getPersonas();*/

  

