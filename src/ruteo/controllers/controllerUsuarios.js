import loggerError from '../../negocio/utils/pinoError.js';
import { usuarioService } from '../../negocio/services/usuario.service.js';


 async function controladorTipoUsuarios(req, res){

  try {
    const usuario = await usuarioService.TipoUsuarios()
    res.status(200).json(usuario)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }


  async function controladorUsuarios(req, res){

    const { busqueda } = req.query; // Puede venir undefined, '' o con texto
  
  try {
    const usuarios = await usuarioService.Usuarios(busqueda, req.user.identidadeducativa)
    res.status(200).json(usuarios)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }

  
 async function controladorTutoresSinUsuario(req, res){

    const { busqueda } = req.query; // Puede venir undefined, '' o con texto
  
  try {
    const usuarios = await usuarioService.TutoresSinUsuario(busqueda, req.user.identidadeducativa)
    res.status(200).json(usuarios)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }


async function controladorUsuariosCrear(req, res) {
  try {

    req.body.identidadeducativa = req.user.identidadeducativa
    req.body.usuario_sistema = req.user.usuario

    const resultado = await usuarioService.UsuariosCrear(req.body);

    return res.status(201).json({
      exito: true,
      mensaje: resultado.personaExistia
        ? "El usuario se creó correctamente (asociado a una persona ya existente)."
        : "Usuario y persona creados correctamente.",
      personaExistia: resultado.personaExistia,
      usuario: resultado.usuario
    });

  } catch (error) {
    console.error("Error en controladorUsuariosCrear:", error);

    // Si es un error conocido (como 'USUARIO_DUPLICADO' o error manual)
    if (error.code === 'USUARIO_DUPLICADO' || error.message.includes("ya existe")) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

        // Si es un error conocido (como 'USUARIO_DUPLICADO' o error manual)
    if (error.code === 'PERSONA_CON_USUARIO' || error.message.includes("La persona ya tiene usuario generado.")) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

    // Para cualquier otro tipo de error de servidor
    return res.status(500).json({ 
      error: "No se pudo registrar el usuario en el servidor.",
      detalle: error.message 
    });
  }
}


   async function controladorUsuariosCrearEnMasa(req, res){

    req.body.identidadeducativa = req.user.identidadeducativa
  
  try {
    const usuarios = await usuarioService.UsuariosCrearEnMasa(req.body)
    res.status(200).json(usuarios)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }


    async function controladorUsuariosActualizar(req, res){

    req.body.identidadeducativa = req.user.identidadeducativa
    req.body.usuario_sistema = req.user.usuario

  try {
    const usuarios = await usuarioService.UsuariosActualizar(req.body)
    res.status(200).json(usuarios)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }

    async function controladorUsuariosEliminar(req, res){

    req.body.identidadeducativa = req.user.identidadeducativa
  
  try {
    const usuarios = await usuarioService.UsuariosEliminar(id)
    res.status(200).json(usuarios)
  } catch (error) {
    loggerError(error)
    res.status(404).json(error)
  }

 }

 async function controladorUsuarioPerfil(req, res) {
   try {
     const perfil = await usuarioService.PerfilUsuario(req.user.id_usuario);
     if (!perfil) {
       return res.status(404).json({ error: "Usuario no encontrado" });
     }
     res.status(200).json(perfil);
   } catch (error) {
     loggerError(error);
     res.status(500).json({ error: error.message });
   }
 }

 async function controladorUsuarioActualizarPerfil(req, res) {
   try {
     const { imagenUrl, password } = req.body;
     if (password && password.trim() !== '' && password.trim().length < 4) {
       return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres." });
     }
     const perfil = await usuarioService.ActualizarPerfilUsuario(req.user.id_usuario, {
       imagenUrl,
       password
     });
     res.status(200).json({
       exito: true,
       mensaje: "Perfil actualizado correctamente",
       usuario: perfil
     });
   } catch (error) {
     loggerError(error);
     res.status(500).json({ error: error.message });
   }
 }

export {
  controladorTipoUsuarios,
  controladorUsuarios,
  controladorTutoresSinUsuario,
  controladorUsuariosCrear,
  controladorUsuariosCrearEnMasa,
  controladorUsuariosActualizar,
  controladorUsuariosEliminar,
  controladorUsuarioPerfil,
  controladorUsuarioActualizarPerfil
}
