import fs from "fs";
import readline from "readline";

import { pool } from "../../daos/db/pgClient.js";
import ContainerPg from "../../daos/container/containerPg.js";


// IMPORTAR TU FUNCIÓN REAL DE ARCA
// Ajustar el path según dónde esté ubicada
import { emitirFacturaAFIP } from "../../services/afip/afipService.js";


// ======================================================
// DETERMINAR TABLA
// ======================================================

const obtenerTabla = (nombreArchivo) => {
  const nombre = nombreArchivo.toUpperCase();

  if (nombre.startsWith("LDEBLIQD")) {
    return "tempArchivoLDEBLIQD";
  }

  if (nombre.startsWith("RDEBLIQC")) {
    return "tempArchivoRDEBLIQC";
  }

  if (nombre.startsWith("RDEBLIMC")) {
    return "tempArchivoRDEBLIMC";
  }

  return null;
};

// ======================================================
// OBTENER CONFIGURACIÓN DE FACTURACIÓN
// ======================================================

const obtenerConfiguracionFacturacion = async (
  identidadEducativa
) => {
  const containerPg = new ContainerPg();

  const parametros = await containerPg.parametros(
    identidadEducativa
  );

  const obtenerParametro = (nombre) => {
    return parametros.find(
      (p) => p.parametro === nombre
    )?.valor;
  };

  // ------------------------------------------
  // ¿DEBE FACTURAR?
  // ------------------------------------------

  const generaAfip = obtenerParametro(
    "genera_comprobante_afip"
  );

  const debeFacturar =
    String(generaAfip).toUpperCase() === "SI";

  // ------------------------------------------
  // CONDICIÓN IVA DEL CLIENTE
  // ------------------------------------------

  const condicionIva = obtenerParametro(
    "condicion_frente_iva_cliente"
  );

  let condicionIvaReceptorId = null;

  switch (
    String(condicionIva).trim().toUpperCase()
  ) {
    case "CONSUMIDOR FINAL":
      condicionIvaReceptorId = 5;
      break;

    case "RESPONSABLE INSCRIPTO":
      condicionIvaReceptorId = 1;
      break;

    case "MONOTRIBUTISTA":
      condicionIvaReceptorId = 6;
      break;

    default:
      condicionIvaReceptorId = 5;
      break;
  }

  // ------------------------------------------
  // PUNTO DE VENTA
  // ------------------------------------------

  const puntoVenta = Number(
    obtenerParametro("punto_venta") || 1
  );

  // ------------------------------------------
  // TIPO DE COMPROBANTE
  // ------------------------------------------
  //
  // Todavía no existe como parámetro en los datos
  // que pasaste.
  //
  // TEMPORALMENTE:
  // 1 = Factura A
  //
  // Esto lo cambiamos cuando definamos el tipo.
  // ------------------------------------------

  const tipoComprobante = Number(
    obtenerParametro("tipo_comprobante_arca") || 1
  );

  return {
    debeFacturar,
    condicionIvaReceptorId,
    puntoVenta,
    tipoComprobante,
  };
};

// ======================================================
// OBTENER DATOS DEL TUTOR
// ======================================================

const obtenerDatosTutor = async (
  client,
  idAlumno
) => {
  const result = await client.query(
    `
    SELECT
        dp.tipo_de_documento_padre AS doc_tipo,
        dp.numero_de_documento_padre AS doc_nro
    FROM public.datos_alumnos da
    INNER JOIN public.datos_padre dp
        ON dp.numero_de_documento_padre =
           da.nro_documento_tutor
    WHERE da.id_alumno = $1
    `,
    [idAlumno]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `No se encontraron datos del tutor para el alumno ${idAlumno}`
    );
  }

  return result.rows[0];
};

// ======================================================
// CONVERTIR IMPORTE
// ======================================================

const convertirImporte = (valor) => {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return 0;
  }

  const importe = Number(
    String(valor)
      .trim()
      .replace(",", ".")
  );

  if (Number.isNaN(importe)) {
    throw new Error(
      `Importe inválido: ${valor}`
    );
  }

  return Math.abs(importe);
};

// ======================================================
// CONVERTIR NÚMERO
// ======================================================

const convertirNumero = (valor) => {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return 0;
  }

  const numero = Number(
    String(valor).trim()
  );

  if (Number.isNaN(numero)) {
    return 0;
  }

  return numero;
};

// ======================================================
// PROCESAR ARCHIVO
// ======================================================

const procesarArchivo = async (archivo) => {
  const client = await pool.connect();

  const nombreArchivo =
    archivo.originalname;

  const rutaArchivo =
    archivo.path;

  try {

    // ==================================================
    // IDENTIDAD EDUCATIVA
    // ==================================================

    // TEMPORALMENTE
    const identidadEducativa = 1;

    // ==================================================
    // DETERMINAR TABLA
    // ==================================================

    const tabla =
      obtenerTabla(nombreArchivo);

    if (!tabla) {
      throw new Error(
        `Archivo no reconocido: ${nombreArchivo}`
      );
    }

    console.log(
      `Procesando archivo: ${nombreArchivo}`
    );

    console.log(
      `Tabla temporal: ${tabla}`
    );

    // ==================================================
    // OBTENER CONFIGURACIÓN
    // ==================================================

    const configuracion =
      await obtenerConfiguracionFacturacion(
        identidadEducativa
      );

    console.log(
      "Configuración facturación:",
      configuracion
    );

    // ==================================================
    // INICIAR TRANSACCIÓN
    // ==================================================

    await client.query("BEGIN");

    // ==================================================
    // LIMPIAR TABLA TEMPORAL
    // ==================================================

    await client.query(
      `DELETE FROM ${tabla}`
    );

    // ==================================================
    // LEER ARCHIVO
    // ==================================================

    const stream =
      fs.createReadStream(
        rutaArchivo,
        {
          encoding: "utf8",
        }
      );

    const rl =
      readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
      });

    let cantidad = 0;

    // ==================================================
    // INSERTAR ARCHIVO EN TABLA TEMPORAL
    // ==================================================

    for await (
      const linea of rl
    ) {

      if (!linea.trim()) {
        continue;
      }

      await client.query(
        `
        INSERT INTO ${tabla}
        (
          contenido
        )
        VALUES ($1)
        `,
        [linea]
      );

      cantidad++;
    }

    console.log(
      `Registros cargados en ${tabla}: ${cantidad}`
    );

    // ==================================================
    // EJECUTAR AFECTACIÓN
    // ==================================================

    await client.query(
      `
      SELECT public.spafectacionarchivodebitorutaarchivo($1)
      `,
      [nombreArchivo]
    );

    console.log(
      "Afectación del archivo finalizada"
    );

    // ==================================================
    // OBTENER DETALLES GENERADOS
    // ==================================================

    const resultadoDetalles =
      await client.query(
        `
        SELECT *
        FROM public.archivo_respuesta_detalle
        WHERE id_archivo_respuesta IN
        (
          SELECT id_archivo_respuesta
          FROM public.archivo_respuesta
          WHERE nombre_archivo = $1
        )
        ORDER BY id_archivo_respuesta_detalle
        `,
        [nombreArchivo]
      );

    console.log(
      `Detalles encontrados: ${resultadoDetalles.rows.length}`
    );

    // ==================================================
    // CONTADORES
    // ==================================================

    let cantidadTransacciones = 0;
    let cantidadFacturas = 0;

    // ==================================================
    // PROCESAR CADA PAGO
    // ==================================================

    for (
      const detalle
      of resultadoDetalles.rows
    ) {

      console.log(
        "----------------------------------------"
      );

      console.log(
        "Procesando detalle:",
        detalle.id_archivo_respuesta_detalle
      );

      // ==================================================
      // VALIDAR ALUMNO
      // ==================================================

      if (!detalle.id_alumno) {

        throw new Error(
          `El detalle ${detalle.id_archivo_respuesta_detalle} no tiene id_alumno`
        );
      }

      if (!detalle.id_alumno_cc) {

        throw new Error(
          `El detalle ${detalle.id_archivo_respuesta_detalle} no tiene id_alumno_cc`
        );
      }

      // ==================================================
      // OBTENER DATOS DEL TUTOR
      // ==================================================

      const datosTutor =
        await obtenerDatosTutor(
          client,
          detalle.id_alumno
        );

      console.log(
        "Datos tutor:",
        datosTutor
      );

      // ==================================================
      // IMPORTE
      // ==================================================

      const importe =
        convertirImporte(
          detalle.importe
        );

      console.log(
        "Importe:",
        importe
      );

      // ==================================================
      // VARIABLES DE FACTURACIÓN
      // ==================================================

      let cae = null;
      let vencimientoCae = null;
      let comprobanteNumero = null;
      let puntoVenta = null;
      let comprobanteTipo = null;

      // ==================================================
      // FACTURAR
      // ==================================================

      if (
        configuracion.debeFacturar
      ) {

        console.log(
          "Generando factura ARCA..."
        );

        puntoVenta =
          configuracion.puntoVenta;

        comprobanteTipo =
          configuracion.tipoComprobante;

        // ----------------------------------------------
        // VALIDAR DOCUMENTO
        // ----------------------------------------------

        if (
          !datosTutor.doc_tipo ||
          !datosTutor.doc_nro
        ) {

          throw new Error(
            `El tutor del alumno ${detalle.id_alumno} no tiene documento válido`
          );
        }

        // ----------------------------------------------
        // EMITIR FACTURA
        // ----------------------------------------------

        const datosAfip =
          await emitirFacturaAFIP({

            puntoVenta,

            tipoComprobante:
              comprobanteTipo,

            docTipo:
              Number(
                datosTutor.doc_tipo
              ),

            docNro:
              Number(
                datosTutor.doc_nro
              ),

            impTotal:
              importe,

            impNeto:
              importe,

            impIva:
              0,

            condicionIvaReceptorId:
              configuracion
                .condicionIvaReceptorId,
          });

        console.log(
          "Respuesta ARCA:",
          datosAfip
        );

        // ----------------------------------------------
        // DATOS DEVUELTOS POR ARCA
        // ----------------------------------------------

        cae =
          datosAfip?.cae ?? null;

        vencimientoCae =
          datosAfip?.vencimientoCae ??
          null;

        comprobanteNumero =
          datosAfip?.numeroComprobante ??
          null;

        puntoVenta =
          datosAfip?.puntoVenta ??
          puntoVenta;

        cantidadFacturas++;

        console.log(
          "Factura generada:",
          {
            cae,
            vencimientoCae,
            comprobanteNumero,
            puntoVenta,
            comprobanteTipo,
          }
        );
      }

      // ==================================================
      // INSERTAR TRANSACCIÓN
      // ==================================================

      console.log(
        "Insertando transacción..."
      );

      await client.query(
        `
        INSERT INTO public.transaccion_cuenta_corriente
        (
          id_alumno_cc,
          fecha_transaccion,
          id_estado_cuota,
          importe,
          fecha_pago,
          fecha_respuesta_prisma,
          usuario_ultima_modificacion,
          fecha_ultima_modificacion,
          numero_comprobante,
          numero_lote,
          numero_autorizacion,
          id_medio_pago,
          id_marca_tarjeta,
          id_motivo_rechazo1,
          id_motivo_rechazo2,
          codigo_error_debito,
          descripcion_error_debito,
          punto_venta,
          comprobante_tipo,
          comprobante_numero,
          importe_actualizado,
          fecha_actualizacion_importe,
          notificado_rechazo,
          fecha_notificacion_rechazo,
          notificado_whatsapp,
          fecha_notificacion_whatsapp,
          notificado_mail,
          fecha_notificacion_mail
        )
        VALUES
        (
          $1,
          CURRENT_TIMESTAMP,
          NULL,
          $2,
          NULL,
          $3,
          '0',
          CURRENT_TIMESTAMP,
          0,
          $4,
          0,
          NULL,
          NULL,
          0,
          0,
          $5,
          $6,
          $7,
          $8,
          $9,
          false,
          NULL,
          false,
          NULL,
          false,
          NULL,
          false,
          NULL
        )
        `,
        [
          // $1
          detalle.id_alumno_cc,

          // $2
          importe,

          // $3
          detalle.fecha_devolucion_respuesta,

          // $4
          convertirNumero(
            detalle.numero_lote
          ),

          // $5
          detalle.codigo_error_debito,

          // $6
          detalle.descripcion_error_debito,

          // $7
          puntoVenta,

          // $8
          comprobanteTipo,

          // $9
          comprobanteNumero,
        ]
      );

      cantidadTransacciones++;

      // ==================================================
      // MARCAR COMO PROCESADO
      // ==================================================

      await client.query(
        `
        UPDATE public.archivo_respuesta_detalle
        SET procesado = 1
        WHERE id_archivo_respuesta_detalle = $1
        `,
        [
          detalle.id_archivo_respuesta_detalle,
        ]
      );

      console.log(
        `Detalle ${detalle.id_archivo_respuesta_detalle} procesado correctamente`
      );
    }

    // ==================================================
    // COMMIT
    // ==================================================

    await client.query("COMMIT");

    console.log(
      "========================================"
    );

    console.log(
      "ARCHIVO PROCESADO CORRECTAMENTE"
    );

    console.log(
      "Transacciones:",
      cantidadTransacciones
    );

    console.log(
      "Facturas:",
      cantidadFacturas
    );

    console.log(
      "========================================"
    );

    return {
      ok: true,

      archivo:
        nombreArchivo,

      tabla,

      registros:
        cantidad,

      detalles:
        resultadoDetalles.rows.length,

      transacciones:
        cantidadTransacciones,

      facturas:
        cantidadFacturas,

      debeFacturar:
        configuracion.debeFacturar,

      mensaje:
        "Archivo procesado correctamente",
    };

  } catch (error) {

    console.error(
      "Error procesando archivo:",
      error
    );

    try {
      await client.query(
        "ROLLBACK"
      );
    } catch (rollbackError) {

      console.error(
        "Error ejecutando ROLLBACK:",
        rollbackError
      );
    }

    throw error;

  } finally {

    client.release();

    // ==================================================
    // ELIMINAR ARCHIVO TEMPORAL
    // ==================================================

    if (
      fs.existsSync(rutaArchivo)
    ) {

      fs.unlinkSync(
        rutaArchivo
      );
    }
  }
};

export {
  procesarArchivo,
};