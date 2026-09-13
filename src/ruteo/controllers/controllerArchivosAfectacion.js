import {
  procesarArchivo as procesarArchivoService
} from "../../negocio/services/archivosafectacion.service.js";

//console.log("🔥 CONTROLLER CARGADO");

const procesarArchivo = async (req, res) => {
  console.log("🌐 ENTRÓ AL CONTROLLER");

  console.log("req.file:", req.file);
  console.log("req.body:", req.body);

  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        mensaje: "No se recibió ningún archivo"
      });
    }

    console.log("🔥 VOY A LLAMAR AL SERVICE");

    const resultado = await procesarArchivoService(req.file);

    console.log("🔥 EL SERVICE TERMINÓ");
    console.log("Resultado:", resultado);

    return res.status(200).json({
      ok: true,
      ...resultado
    });

  } catch (error) {
    console.error("Error en procesarArchivo:", error);

    return res.status(500).json({
      ok: false,
      mensaje: error.message
    });
  }
};

export default {
  procesarArchivo
};