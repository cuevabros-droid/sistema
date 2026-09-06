import { parametrosService } from "../../negocio/services/parametros.service.js";


export async function controladorParametros(req, res) {
    //const identidadeducativa = await req.body.usuario.identidadeducativa;

    try {
        const resul = await parametrosService.parametros(req.user.identidadeducativa);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        res.status(404).json({
            error: error.message
        });
    }
}
