import { validateUser } from "../utils/jwt.js"
import loggerWarn from '../../negocio/utils/pinoWarn.js';


export function autenticacion(req, res, next) {

    // si no tiene credenciales/token reboto con error 401....
  try {
    const authorizationHeader = req.headers.authorization  

    if (!authorizationHeader) {
      res.status(401).json({mensaje: "No está logueado"})
      return "No está logueado"
    }

    // buscamos un bearer token, con formato: 'bearer gs98d7ff97fdg987df9g87ads9f8a7sd98af7'
    const token = authorizationHeader.split(' ')[1]

    const {user, exp} = validateUser(token)

    loggerWarn(`Le queda (${Math.trunc((exp * 1000 - Date.now())/1000)}) segundos para que la sesion se expire`)

    req.user = user
            //console.log(req.user.usuario)

    next()
  } catch (error) {
      loggerWarn(error) 
  }
      
}