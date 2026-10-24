import reportesService from '../../negocio/services/reportes.service.js';

export async function controllerEjecutarReporte(req, res) {
  try {
    const { tipoReporte, parametros = {} } = req.body;
    if (!tipoReporte) {
      return res.status(400).json({ error: 'El parámetro tipoReporte es obligatorio.' });
    }

    // Inyectar la entidad educativa seleccionada si no viene explícita
    if (!parametros.identidadeducativa && req.user?.identidadeducativa) {
      parametros.identidadeducativa = req.user.identidadeducativa;
    }

    const resultado = await reportesService.ejecutarReporte(tipoReporte, parametros);

    // Si la función de postgres devuelve un objeto con error: true
    if (resultado && typeof resultado === 'object' && !Array.isArray(resultado) && resultado.error) {
      return res.status(400).json(resultado);
    }

    return res.json(resultado);
  } catch (error) {
    console.error('Error en controllerEjecutarReporte:', error);
    return res.status(500).json({ 
      error: 'Error interno al procesar el reporte', 
      detalle: error.message 
    });
  }
}

