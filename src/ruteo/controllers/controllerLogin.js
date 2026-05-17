import loggerError
from '../../negocio/utils/pinoError.js';

import {
    loginService
}
from '../../negocio/services/login.service.js';

import {
    createToken
}
from '../../negocio/utils/jwt.js';

import {
    validatePassword
}
from '../../negocio/utils/bcrypt.js';


async function controladorLoginp(
    req,
    res
) {

    const usuario =
        await loginService.buscar_usuario(
            req.body.usuario
        );

    let mensaje = "";

    // USUARIO NO EXISTE
    if (!usuario) {

        mensaje =
            "Usuario inexistente";
    }


    // PASSWORD INCORRECTO
    if (
        usuario &&
        !validatePassword(
            req.body.password,
            usuario.password_hash
        )
    ) {

      
        mensaje =
            "Password incorrecto";
    }

    // LOGIN OK
    if (mensaje === "") {

        const token =
            createToken(usuario);

        res.header(
            'authorization',
            `Bearer ${token}`
        );

        return res.status(200).json({

            ok: true,

            token,

            usuario: {
                id_usuario:
                    usuario.id_usuario,

                usuario:
                    usuario.usuario,

                email:
                    usuario.email,

                nombre:
                    usuario.nombre,

                idTipoUsuario:
                    usuario.idtipousuario
            }
        });

    } else {

        loggerError(mensaje);

        return res.status(403).json({
            ok: false,
            mensaje
        });
    }
}

export {
    controladorLoginp
};