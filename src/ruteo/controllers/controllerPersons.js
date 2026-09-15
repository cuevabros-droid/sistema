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
  const listaElementos = Array.isArray(body) 
    ? body 
    : (body?.personas || body?.body || body?.data || []);

  const tieneSaldoTotal = body?.tieneSaldoTotal === true || 
    listaElementos.some(item => 
      item.tieneSaldoTotal === true || 
      (item.saldo_total !== undefined && item.saldo_total !== null && item.saldo_total !== '$ 0,00' && item.saldo_total !== 0)
    );

  const hayAlumnos = listaElementos.some(item => item.es_alumno === 'S' || item.es_alumno === 'Alumno');
  const hayTutores = listaElementos.some(item => item.es_alumno === 'N' || item.es_alumno === 'Tutor');
  const esSoloTutores = hayTutores && !hayAlumnos; // 🟢 TRUE si no hay ningún alumno

  let tituloReporte = body?.titulo || listaElementos[0]?.titulo;

  if (!tituloReporte) {
    if (tieneSaldoTotal) {
      tituloReporte = "Reporte de Alumnos - Estado de Cuenta";
    } else if (hayAlumnos && hayTutores) {
      tituloReporte = "Reporte de Alumnos/Tutores";
    } else if (hayAlumnos) {
      tituloReporte = "Reporte de Alumnos";
    } else if (hayTutores) {
      tituloReporte = "Reporte de Tutores";
    } else {
      tituloReporte = "Reporte de Personas";
    }
  }

// Columnas base
const excelColumns = [
  { header: 'Apellido', key: 'apellidos', width: 25, style: { alignment: { wrapText: true, vertical: 'middle' } } },
  { header: 'Nombres', key: 'nombres', width: 25, style: { alignment: { wrapText: true, vertical: 'middle' } } },
  { header: 'Tipo Doc.', key: 'nombre_corto', width: 10, style: { alignment: { wrapText: true } } },
  { header: 'Número', key: 'numero', width: 15 },
  { header: 'Alumno/Tutor', key: 'es_alumno', width: 15, getValue: (row) => row.es_alumno === 'S' ? 'Alumno' : 'Tutor' }
];

// Agregamos 'Nivel' SOLO si NO es exclusivo de Tutores
if (!esSoloTutores) {
  excelColumns.push({ 
    header: 'Nivel - Grado/Curso - División', 
    key: 'nivel', 
    width: 32, 
    style: { alignment: { wrapText: true, vertical: 'middle' } } 
  });
}

  // Agregamos 'Saldo Total' si corresponde
  if (tieneSaldoTotal) {
    excelColumns.push({ 
      header: 'Saldo Total', 
      key: 'saldo_total', 
      width: 20,
      style: { numFmt: '"$"#,##0.00' }
    });
  }

  const dataFormateada = listaElementos.map(item => ({
    ...item,
    saldo_total: Number(item.saldo_total || 0)
  }));

  try {
    const { exportToExcelCustom } = await import('../../negocio/utils/excel.js');

    await exportToExcelCustom({
      columnsConfig: excelColumns,
      data: dataFormateada,
      fileName: tituloReporte,
      sheetName: tituloReporte,
      res
    });
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    return res.status(500).json({ message: "Error al generar el Excel" });
  }
}

async function controllerPersonaPDF({ user, body }, res) {
  const listaElementos = Array.isArray(body) 
    ? body 
    : (body?.personas || body?.body || body?.data || []);

  const tieneSaldoTotal = body?.tieneSaldoTotal === true || 
    listaElementos.some(item => 
      item.tieneSaldoTotal === true || 
      (item.saldo_total !== undefined && item.saldo_total !== null && item.saldo_total !== '$ 0,00' && item.saldo_total !== 0)
    );

  // 1. Evaluamos la presencia de alumnos y tutores en la lista
  const hayAlumnos = listaElementos.some(item => item.es_alumno === 'S' || item.es_alumno === 'Alumno');
  const hayTutores = listaElementos.some(item => item.es_alumno === 'N' || item.es_alumno === 'Tutor');
  const esSoloTutores = hayTutores && !hayAlumnos; // 🟢 TRUE si no hay ningún alumno

  // 2. Determinamos el título dinámico
  let tituloReporte = body?.titulo || listaElementos[0]?.titulo;

  if (!tituloReporte) {
    if (tieneSaldoTotal) {
      tituloReporte = "Reporte de Alumnos - Estado de Cuenta";
    } else if (hayAlumnos && hayTutores) {
      tituloReporte = "Reporte de Alumnos/Tutores";
    } else if (hayAlumnos) {
      tituloReporte = "Reporte de Alumnos";
    } else if (hayTutores) {
      tituloReporte = "Reporte de Tutores";
    } else {
      tituloReporte = "Reporte de Personas";
    }
  }

  // 3. Columnas base (sin 'Nivel' de entrada)
  const pdfColumns = [
    { header: 'Apellido', key: 'apellidos', width: '25%' },
    { header: 'Nombres', key: 'nombres', width: '25%' },
    { header: 'Tipo Doc.', key: 'nombre_corto', width: '10%' },
    { header: 'Número', key: 'numero', width: '14%' },
    { header: 'Alumno/Tutor', key: 'es_alumno', width: '15%' },
  ];

  // 🟢 4. Agregamos 'Nivel' SOLO si NO es exclusivo de Tutores
  if (!esSoloTutores) {
    pdfColumns.push({ header: 'Nivel - Grado/Curso - División', key: 'nivel', width: '40%' });
  }

  // 5. Agregamos 'Saldo Total' si corresponde
  if (tieneSaldoTotal) {
    pdfColumns.push({ header: 'Saldo Total', key: 'saldo_total', width: '20%' });
  }

  const bodyFormateado = listaElementos.map(item => {
    const monto = item.saldo_total ?? item.saldoTotal ?? 0;
    return {
      ...item,
      es_alumno: item.es_alumno === 'S' ? 'Alumno' : (item.es_alumno === 'N' ? 'Tutor' : item.es_alumno),
      saldo_total: `$ ${Number(monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
  });

  try {
    const React = (await import('react')).default;
    const { GenericPDFReport } = await import('../../negocio/utils/pdf.js');
    const { renderToBuffer } = await import('@react-pdf/renderer');

    const doc = React.createElement(GenericPDFReport, {
      data: bodyFormateado,
      columns: pdfColumns,
      title: tituloReporte
    });

    const buffer = await renderToBuffer(doc);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${tituloReporte.replace(/[\/\s]+/g, '_')}.pdf"`);

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
    if (body.afip) {
      // Validar que qrUrl sea una cadena de texto real no vacía
      const urlValida = (typeof body.afip.qrUrl === 'string' && body.afip.qrUrl.trim().length > 0)
        ? body.afip.qrUrl
        : 'https://www.afip.gob.ar/fe/qr/';

      body.afip.qrDataUrl = await QRCode.toDataURL(urlValida, {
        errorCorrectionLevel: 'L',
        margin: 2,
        scale: 6,
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


