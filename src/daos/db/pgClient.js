//import { Pool } from 'pg';
import pkg from 'pg'
const { Pool } = pkg;
//import { Pool } from 'pg';
import { HOST, DB_NAME, USER, PASSWORD, PORT } from './config.js';

 export const pool = new Pool({
    user: USER,
    host: HOST,
    database: DB_NAME,
    password: PASSWORD,
    port: PORT
  })

  console.log(pool)
  //await pool.connect()

  //export const pgDb = pool.database

  
 /* const getPersonas = async () => {
    console.log((await pool.query('select apellidos, nombres from persona')).rows);
  }

  getPersonas();*/

  

