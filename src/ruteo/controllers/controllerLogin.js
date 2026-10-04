import loggerError from "../../negocio/utils/pinoError.js";

import { loginService } from "../../negocio/services/login.service.js";

import { createToken } from "../../negocio/utils/jwt.js";

import { validatePassword } from "../../negocio/utils/bcrypt.js";

async function controladorLoginp(req, res) {
  try {
    const usuario = await loginService.buscar_usuario(req.body.usuario);

    // USUARIO NO EXISTE
    if (!usuario) {
      loggerError("Usuario inexistente");

      return res.status(403).json({
        ok: false,
        mensaje: "Usuario incorrecto",
      });
    }

    // PASSWORD INCORRECTO
    const passwordValido = await validatePassword(
      req.body.password,
      usuario.password_hash,
    );

    if (!passwordValido) {
      loggerError("Password incorrecto");

      return res.status(403).json({
        ok: false,
        mensaje: "Password incorrecto",
      });
    }

    // INSTITUCIONES A LAS QUE PERTENECE EL USUARIO
    const entidades = await loginService.buscar_entidades(usuario.id_usuario);

    // PAYLOAD DEL TOKEN
    const payload = {

        id_usuario: usuario.id_usuario,

        usuario: usuario.usuario,

        email: usuario.email,

        nombre: usuario.nombre,

        idtipoUsuario: usuario.idtipousuario,
        tipoUsuario: usuario.tipousuario,
        identidadeducativa: usuario.identidadeducativa,
        entidadeducativa: usuario.entidadeducativa
    };

   // console.log(payload);
    // TOKEN
    const token = createToken(payload);

    res.header("authorization", `Bearer ${token}`);

    // RESPUESTA
    return res.status(200).json({
      ok: true,

      token,

      usuario: {
        id_usuario: usuario.id_usuario,

        usuario: usuario.usuario,

        email: usuario.email,

        nombre: usuario.nombre,

        idtipoUsuario: usuario.idtipousuario,
        tipoUsuario: usuario.tipousuario,
        identidadeducativa: usuario.identidadeducativa,
        entidadeducativa: usuario.entidadeducativa,
        imagen: usuario.imagen,
        id_persona: usuario.id_persona,
        apellidos: usuario.apellidos,
        nombres: usuario.nombres,
        entidades,
      },
    });
  } catch (error) {
    loggerError(error);

    return res.status(500).json({
      ok: false,

      mensaje: "Error interno del servidor",
    });
  }
}

// Genera un nuevo token para la institución seleccionada por el usuario
async function controladorCambiarInstitucion(req, res) {
  try {
    const { identidadeducativa } = req.body;
    const entidad = await loginService.buscar_entidad_de_usuario(
      req.user.id_usuario,
      identidadeducativa,
    );

    if (!entidad) {
      return res.status(403).json({
        ok: false,
        mensaje: "El usuario no pertenece a la institución seleccionada",
      });
    }

    const payload = {
      ...req.user,
      identidadeducativa: entidad.identidadeducativa,
      entidadeducativa: entidad.entidadeducativa,
    };

    const token = createToken(payload);

    return res.status(200).json({
      ok: true,
      token,
      identidadeducativa: entidad.identidadeducativa,
      entidadeducativa: entidad.entidadeducativa,
      logo: entidad.logo,
    });
  } catch (error) {
    loggerError(error);
    return res.status(500).json({ ok: false, mensaje: "Error interno del servidor" });
  }
}

export { controladorLoginp, controladorCambiarInstitucion };
