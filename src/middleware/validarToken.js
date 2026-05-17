const jwt = require('jsonwebtoken');

const validarToken = (
    req,
    res,
    next
) => {

    try {

        const token =
            req.header('Authorization');

        if (!token) {

            return res.status(401).json({
                ok: false,
                mensaje: 'Token requerido'
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        req.usuario = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido'
        });
    }
};

module.exports = validarToken;