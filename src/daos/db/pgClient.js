//import { Pool } from 'pg';
import pkg from 'pg'
const { Pool } = pkg;
import { HOST, DB_NAME, USER, PASSWORD, PORT } from './config.js';
/*
 export const pool = new Pool({
    //password: 'Sistema1y2+2',
    password: 'postgres',
    port: 5432
   // port: 5433
  }) 
 */

   export const pool = new Pool({
 
    user: USER,
    host: HOST,
    database: DB_NAME,
    password: PASSWORD,
    port: PORT,
 
  })
