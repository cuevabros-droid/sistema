import loggerError from '../../negocio/utils/pinoError.js';
import { persontService } from '../../negocio/services/person.service.js';
import {pool} from '../../daos/db/pgClient.js';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode'; // o const QRCode = require('qrcode');


 async function controllerPersons(req, res) {

try {
    // req.query contiene los QueryParams que mandó React: { search, esAlumno, esTutor, estado }
    const personas = await persontService.listarPersonas(req.query);
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las personas" });
  }

}


async function controllerListarPersons(req, res) {

  try {
    const pers = await persontService.listarPerson(req.user)
    res.status(200).json(pers)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}


async function controllerPersonsConFiltro({ params: { texto } }, res) {
  try {
    const resul = await persontService.listarPersonsConFiltro(texto)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }

}
   

  async function controllerPersonsUpdate({ user, body, params: { id } }, res) {
   
  try {
    body.usuario_sistema= user.usuario
    const resul = await persontService.updatePersons(body, id)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }


  async function controllerPersonsUpdateEstado({ user, params: { id } }, res) {
    
      const usuario_sistema = user.usuario

      const objeto = {
        id,
        usuario_sistema
      }
     

    try {

      const resul = await persontService.updatePersonsEstado(objeto)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }

  async function controllerPersonsCreate({ user, body }, res) {
    try {
      body.usuario_sistema = user.usuario
      const resul = await persontService.PersonsCreate(body)
      return res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      return res.status(404).json({error: error.message})
    }
  }


    async function controllerPersonsSaldos({ user, params: { id_alumno } }, res){
      try {
    const resul = await persontService.listarSaldoAlumnoPorId(id_alumno)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
  }
  
  async function controllerAlumnosPorTutor({ user, params: { usuario } }, res){
      try {
    const resul = await persontService.listarAlumnosPorUsuario(usuario)
    res.status(201).json(resul)
     } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
     }
  }

    async function controllerAlumnosPorTutorId({ user, params: { id } }, res){
      try {
        const resul = await persontService.listarAlumnosPorId(id, user.identidadeducativa)
        res.status(201).json(resul)
        } catch (error) {
        loggerError(error.message)
        res.status(404).json({error: error.message})
     }
  }

      
  async function controllerAlumnoTutoresId({ user, params: { id } }, res){
      try {
        const resul = await persontService.listarTutoresPorId(id)
        res.status(201).json(resul)
        } catch (error) {
        loggerError(error.message)
        res.status(404).json({error: error.message})
     }
  }


  async function controllerPersonsConFiltroApellidoDocumento({ params: { apellidodocumento } }, res) {
  try {
    const resul = await persontService.listarPersonsConFiltroApellidoDocumento(apellidodocumento)
    res.status(201).json(resul)
  } catch (error) {
    loggerError(error.message)
    res.status(404).json({error: error.message})
  }
}

  async function controllerPersonaAllegadaCreate({ user, body }, res) {
    try {
      body.usuario_sistema = user.usuario
      const resul = await persontService.PersonaAllegadaCreate(body)
      return res.status(201).json(resul)
    } catch (error) {
        console.error("Error en controllerPersonaAllegadaCreate:", error);
            // Devuelve respuesta limpia al frontend
            return res.status(500).json({ 
              error: error.message || "Error interno al guardar allegado" 
            });
    }
  }

  async function controllerPersonaAllegadaDelete(req, res) {
    const id = req.params.id
    try {
      const resul = await persontService.eliminarAllegado(id)
      res.status(201).json(resul)
    } catch (error) {
      loggerError(error.message)
      loggerError(error.message)
      res.status(404).json({error: error.message})
    }
  }
  
    async function controllerPersonaAllegadaUpdate({ user, body, params: { id } }, res) {
      try {
        body.usuario_sistema= user.usuario
        const resul = await persontService.updatePersonaAllegada(body, id)
        res.status(201).json(resul)
      } catch (error) {
        loggerError(error.message)
        res.status(404).json({error: error.message})
      }
  }


  async function controllerPersonaExcel({ user, body }, res) {
     const personas = Array.isArray(body) ? body : (body?.data || []);
 
 // 2. Configuración para ExcelJS
  const excelColumns = [
    { header: 'Apellido', key: 'apellidos', width: 35 },
    { header: 'Nombres', key: 'nombres', width: 35 },
    { header: 'Tipo de Documento', key: 'nombre_corto', width: 16 },
    { header: 'Número', key: 'numero', width: 15 },
    { header: 'Tipo de Usuario', key: 'es_alumno', width: 15, getValue: (row) => row.es_alumno === 'S' ? 'Alumno' : 'Tutor' },
  ];

  try {
    const { exportToExcelCustom } = await import('../../negocio/utils/excel.js');

    // Le pasamos `res` (la respuesta de Express/Node)
    await exportToExcelCustom({
      columnsConfig: excelColumns,
      data: personas,
      fileName: 'Reporte_Personas',
      sheetName: 'Reporte de Personas',
      res // <-- ¡IMPORTANTE! Agregar res aquí
    });
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    res.status(500).json({ message: "Error al generar el Excel" });
  }
  }


 async function controllerPersonaPDF({ user, body }, res) {

  const pdfColumns = [
    { header: 'Apellido', key: 'apellidos', width: '30%' },
    { header: 'Nombres', key: 'nombres', width: '30%' },
    { header: 'Tipo de Documento', key: 'nombre_corto', width: '16%' },
    { header: 'Número', key: 'numero', width: '12%' },
    { header: 'Tipo de Usuario', key: 'es_alumno', width: '15%' },
  ];

  try {
    // 1. Cargar dependencias
    const React = (await import('react')).default;
    const { GenericPDFReport } = await import('../../negocio/utils/pdf.js');
// 👈 IMPORTANTE: Importa renderToBuffer en lugar de pdf
    const { renderToBuffer } = await import('@react-pdf/renderer');

  // 1. Instanciar el documento
const doc = React.createElement(GenericPDFReport, {
  data: body,
  columns: pdfColumns,
  title: "Reporte de Personas"
});



// 3. Generar el Buffer del PDF con renderToBuffer
    const buffer = await renderToBuffer(doc);

    // 4. Configurar cabeceras HTTP
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Reporte_Personas.pdf"');

    // 5. Enviar el buffer compilado
    return res.end(buffer);

  } catch (error) {
    console.error("Error al generar PDF:", error);
    return res.status(500).json({ message: "Error al generar el PDF" });
  }
}


async function controllerFacturaPDF({ user, body }, res) {

  try {
    // 1. Cargar dependencias dinámicamente
    const React = (await import('react')).default;
    const { FacturaPDF } = await import('../../negocio/utils/facturaPDF.js'); // Revisa la ruta de tu componente
    const { renderToBuffer } = await import('@react-pdf/renderer');

    // 1. Generar la imagen Base64 del QR antes de armar el PDF
    if (body.afip && body.afip.qrUrl) {
      body.afip.qrDataUrl = await QRCode.toDataURL(body.afip.qrUrl, {
          errorCorrectionLevel: 'L', // 'L' (Low 7%) genera la menor cantidad de cuadritos posibles. ¡Súper escaneable!
          margin: 2,                 // Crea el borde blanco indispensable alrededor para que el celular reconozca el QR
          scale: 6,                  // Le da buena nitidez de definición
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
      });
    }
    
    // 1. Obtener la ruta del archivo y convertir a Base64
    let logoBase64 = null;
    const logoRelativo = body.emisor?.logoUrl; // Ej: '/logoEscuela.png'

    if (logoRelativo) {
      const rutaFisica = path.join(process.cwd(), 'public', logoRelativo);
      if (fs.existsSync(rutaFisica)) {
        const fileBuffer = fs.readFileSync(rutaFisica);
        // Ajusta 'image/png' o 'image/jpeg' según corresponda
        logoBase64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
      }
    }


     body = {
      ...body,
      emisor: {
        ...body.emisor,
        logoUrl: logoBase64
      }
    };

    // 2. Instanciar la plantilla pasándole 'body' como la propiedad 'data'
    const doc = React.createElement(FacturaPDF, { data: body });
    // 3. Generar el Buffer del PDF
    const buffer = await renderToBuffer(doc);

    // 4. Configurar cabeceras HTTP
    const numComprobante = body.emisor.numeroComprobante || 'comprobante';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="Factura_${numComprobante}.pdf"`);

    // 5. Enviar el buffer compilado
    return res.end(buffer);

  } catch (error) {
    console.error("Error al generar PDF de Factura:", error);
    return res.status(500).json({ message: "Error al generar el PDF de la factura" });
  }
}


export {controllerPersons, controllerListarPersons, controllerPersonsConFiltro, controllerPersonsUpdate, controllerPersonsUpdateEstado, controllerPersonsCreate, controllerPersonsSaldos, controllerAlumnosPorTutor, controllerAlumnosPorTutorId, controllerAlumnoTutoresId, controllerPersonsConFiltroApellidoDocumento, controllerPersonaAllegadaCreate, controllerPersonaAllegadaDelete, controllerPersonaAllegadaUpdate, controllerPersonaExcel, controllerPersonaPDF, controllerFacturaPDF}


