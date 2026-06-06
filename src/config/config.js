import dotenv from 'dotenv'
dotenv.config()

let MONGOCONECTIONSEGUNENVIRONMENT
if(process.env.ENVIRONMENT === 'prod')
    MONGOCONECTIONSEGUNENVIRONMENT = process.env.MONGOCONECTIONPROD

export const DBNAME=process.env.DBNAME
export const USERDB=process.env.USERDB
export const PASSWORDDB=process.env.PASSWORDDB
export const PORTDB=process.env.PORTDB
export const HOSTDB=process.env.HOSTDB
//export const CONECTION=CONECTIONSEGUNENVIRONMENT
//export const MONGODB=process.env.MONGODB
export const PERSISTENCIA=process.env.PERSISTENCIA
export const SALTENV=process.env.SALTENV
export const MODO_POR_DEFECTO=process.env.MODO_POR_DEFECTO
export const PUERTO_POR_DEFECTO=process.env.PUERTO_POR_DEFECTO
export const SERVICEEMAIL=process.env.SERVICEEMAIL
export const PORTEMAIL=process.env.PORTEMAIL
export const EMAILADMIN=process.env.EMAILADMIN
export const PASSWORDADMIN=process.env.PASSWORDADMIN

