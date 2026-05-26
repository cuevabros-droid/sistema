//import { Pool } from 'pg';
import pkg from 'pg'
const { Pool } = pkg;
//import { Pool } from 'pg';
/*
 export const pool = new Pool({
    user: 'postgres',
    //host: '31.220.31.59',
    host: '76.13.167.174',
    //host: 'localhost',
    database: 'gestion_escuelas',
    //database: 'quinta',
    //password: 'toba123*-a_postgres',
<<<<<<< HEAD
    //password: 'Sistema1y2+2',
    password: 'postgres',
    port: 5432
   // port: 5433
  })*/
 
   export const pool = new Pool({
    user: 'postgres',
    host: '76.13.167.174',
    database: 'gestion_escuelas',
    password: 'Sistema1y2+2',
=======
    password: 'Sistema1y2+2',
    //password: 'postgres',
    //port: 5432
>>>>>>> 56dc9b563f2b3fa4f968d43869d3185556667158
    port: 5433
  })

  //await pool.connect()

  //export const pgDb = pool.database

  
 /* const getPersonas = async () => {
    console.log((await pool.query('select apellidos, nombres from persona')).rows);
  }

  getPersonas();*/

  

