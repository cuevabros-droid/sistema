import loggerError from '../../negocio/utils/pinoError.js';
import loggerWarn from '../../negocio/utils/pinoWarn.js';
import loggerInfo from '../../negocio/utils/pinoInfo.js';
import { loginService }
from '../../negocio/services/login.service.js';
//import {cartService} from '../../negocio/services/cart.service.js'
import { createToken } from '../../negocio/utils/jwt.js';


 
async function controladorRegistro(req, res) {
  const existe = await userService.buscar_usuario(req.body.email)

  if(existe != null){
    loggerWarn("El usuario ya existe")
    res.status(401).json({mensaje: "El usuario ya existe"})
    return "El usuario ya existe"
  }

  const objeto = req.body; 

  const usuario = await userService.grabarUsuario(objeto);

  //Creo el Token y lo envio al header
  const token = createToken(usuario)
  res.header('authorization', token)
  //loggerInfo({"token": token})
  
  //Doy de alta un carrito para este usuario
  const productos = []

  const carrito = {
    usuario: usuario._id,
    productos: productos
  }

  await cartService.grabarCarritoUsuario(carrito);

  res.status(201).json(usuario)

 }


async function controladorInfousuario(req, res){

  try {
    const usuario = await userService.usuarioInfo(req.user)
    res.status(200).json(usuario)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }


 
  
export {controladorRegistro, controladorInfousuario}
