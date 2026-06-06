import {DBNAME} from '../../config/config.js'
import {HOSTDB} from '../../config/config.js'
import {PORTDB} from '../../config/config.js'
import {USERDB} from '../../config/config.js'
import {PASSWORDDB} from '../../config/config.js'
import {PERSISTENCIA} from '../../config/config.js'
import loggerInfo from '../../negocio/utils/pinoInfo.js';


//MongoDB
export const HOST = HOSTDB
export const PORT = PORTDB
export const USER = USERDB
export const DB_NAME = DBNAME
export const PASSWORD = PASSWORDDB
export default PERSISTENCIA 


loggerInfo("Estoy conectado con: " + PERSISTENCIA) 
