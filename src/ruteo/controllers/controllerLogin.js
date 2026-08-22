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

export { controladorLoginp };
