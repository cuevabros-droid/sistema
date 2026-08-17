import { procesarArchivo as procesarArchivoService } from "../../negocio/services/archivosafectacion.service.js";

const procesarArchivo = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                ok: false,
                mensaje: "No se recibió ningún archivo"
            });

        }

        const resultado = await procesarArchivoService(req.file);

        return res.status(200).json({
            ok: true,
            ...resultado
        });

    } catch (error) {

        console.error(
            "Error en procesarArchivo:",
            error
        );

        return res.status(500).json({
            ok: false,
            mensaje: error.message
        });

    }

};

export default {
    procesarArchivo
};