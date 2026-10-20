import { parametrosService } from "../../negocio/services/parametros.service.js";


export async function controladorParametros(req, res) {
    //const identidadeducativa = await req.body.usuario.identidadeducativa;
    try {
        // Si la URL trae ?id_establecimiento=2 toma ese valor, de lo contrario usa el del token
        const id_establecimiento = req.query.id_establecimiento || req.user?.id_establecimiento;

        const resul = await parametrosService.parametros(id_establecimiento);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        res.status(404).json({
            error: error.message
        });
    }
}

