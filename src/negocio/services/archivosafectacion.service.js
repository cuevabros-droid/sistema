import fs from "fs";
import readline from "readline";

import { pool } from "../../daos/db/pgClient.js";
import { ContainerPg } from "../../daos/container/containerPg.js";

// FUNCIÓN REAL DE ARCA
import { emitirFacturaAFIP } from "../utils/afip.js";

import { pagosService } from "./pagos.service.js";

// ======================================================
// DETERMINAR TABLA
// ======================================================

let id_medio_pago = 0;
let id_marca_tarjeta = 0;

const obtenerTabla = (nombreArchivo) => {
  const nombre = nombreArchivo.toUpperCase();

  if (nombre.startsWith("LDEBLIQD")) {
    id_marca_tarjeta = 1;
    id_medio_pago = 3;

    return "tempArchivoLDEBLIQD";
  }

  if (nombre.startsWith("RDEBLIQC")) {
    id_marca_tarjeta = 1;
    id_medio_pago = 4;

    return "tempArchivoRDEBLIQC";
  }

  if (nombre.startsWith("RDEBLIMC")) {
    id_marca_tarjeta = 2;
    id_medio_pago = 4;

    return "tempArchivoRDEBLIMC";
  }

  return null;
};

// ======================================================
// OBTENER FECHA DE PAGO
// ======================================================

const obtenerFechaPago = (nombreArchivo) => {
  const match = nombreArchivo.match(/_(\d{8})\d{4}/);

  if (!match) {
    throw new Error(
      `No se pudo obtener la fecha de pago del archivo: ${nombreArchivo}`
    );
  }

  const fecha = match[1];

  const anio = fecha.substring(0, 4);
  const mes = fecha.substring(4, 6);
  const dia = fecha.substring(6, 8);

  return `${anio}-${mes}-${dia}`;
};

// ======================================================
// OBTENER CONFIGURACIÓN DE FACTURACIÓN
// ======================================================

const obtenerConfiguracionFacturacion = async (identidadEducativa) => {
  const containerPg = new ContainerPg();

  const resultado = await containerPg.parametros(identidadEducativa);

  const parametros = Array.isArray(resultado)
    ? resultado
    : resultado?.rows || resultado?.data || [];

  const obtenerParametro = (nombre) => {
    const parametro = parametros.find(
      (p) => p.parametro === nombre
    );

    return parametro?.valor;
  };

  // ------------------------------------------------------
  // GENERA COMPROBANTE ARCA
  // ------------------------------------------------------

  const generaAfip = obtenerParametro(
    "genera_comprobante_afip"
  );

  const debeFacturar =
    String(generaAfip ?? "")
      .trim()
      .toUpperCase() === "SI";

  // ------------------------------------------------------
  // CONDICIÓN IVA
  // ------------------------------------------------------

  const condicionIva = obtenerParametro(
    "condicion_frente_iva_cliente"
  );

  let condicionIvaReceptorId = 5;

  switch (
    String(condicionIva ?? "")
      .trim()
      .toUpperCase()
  ) {
    case "RESPONSABLE INSCRIPTO":
      condicionIvaReceptorId = 1;
      break;

    case "MONOTRIBUTISTA":
      condicionIvaReceptorId = 6;
      break;

    case "CONSUMIDOR FINAL":
    default:
      condicionIvaReceptorId = 5;
      break;
  }

  // ------------------------------------------------------
  // PUNTO DE VENTA
  // ------------------------------------------------------

  const puntoVenta = Number(
    obtenerParametro("punto_venta") || 1
  );

  // ------------------------------------------------------
  // TIPO COMPROBANTE
  // ------------------------------------------------------

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
// MAPEO DOCUMENTOS SISTEMA -> ARCA
// ======================================================

const MAP_DOC_AFIP = {
  1: 90, // LC
  2: 89, // LE
  3: 94, // Pasaporte
  4: 0,  // CI
  6: 80, // CUIT
  7: 86, // CUIL
  8: 96, // DNI
  9: 91, // NIF
  10: 96 // DNI Temporario
};

// ======================================================
// OBTENER CÓDIGO DOCUMENTO ARCA
// ======================================================

const obtenerDocTipoAfip = (idTipoDocumentoLocal) => {
  return MAP_DOC_AFIP[idTipoDocumentoLocal] ?? 99;
};

// ======================================================
// OBTENER DATOS DEL TUTOR
// ======================================================

const obtenerDatosTutor = async (client, idAlumno) => {
  const result = await client.query(
    `
      SELECT
          p.id_persona,
          ptd.numero,
          ptd.id_tipo_documento,
          td.nombre AS tipo_documento
      FROM public.alumno a
      INNER JOIN public.persona_allegado pa
          ON pa.id_alumno = a.id_alumno
      INNER JOIN public.persona p
          ON p.id_persona = pa.id_persona
      INNER JOIN public.persona_tipo_documento ptd
          ON ptd.id_persona = p.id_persona
      INNER JOIN public.tipo_documento td
          ON td.id_tipo_documento = ptd.id_tipo_documento
      WHERE a.id_alumno = $1
        AND pa.tutor = 'S'
        AND ptd.numero IS NOT NULL
        AND TRIM(ptd.numero) <> ''
      ORDER BY
          CASE
              WHEN ptd.id_tipo_documento = 7 THEN 1
              WHEN ptd.id_tipo_documento = 8 THEN 2
              ELSE 3
          END
      LIMIT 1
    `,
    [idAlumno]
  );

  if (result.rows.length === 0) {
    throw new Error(
      `No se encontraron datos del tutor para el alumno ${idAlumno}`
    );
  }

  const documento = result.rows[0];

  const docTipoAfip = obtenerDocTipoAfip(
    documento.id_tipo_documento
  );

  return {
    docTipoAfip,
    docNro: documento.numero,
    idTipoDocumentoLocal: documento.id_tipo_documento,
    tipoDocumento: documento.tipo_documento,
  };
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

  const texto = String(valor)
    .trim()
    .replace(",", ".");

  const importe = Number(texto);

  if (Number.isNaN(importe)) {
    throw new Error(`Importe inválido: ${valor}`);
  }

  // Siempre devuelve importe positivo
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
// CONVERTIR FECHA
// ======================================================

const convertirFecha = (valor) => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return null;
  }

  const texto = String(valor).trim();

  if (texto === "") {
    return null;
  }

  const fecha = new Date(texto);

  if (Number.isNaN(fecha.getTime())) {
    throw new Error(
      `Fecha inválida recibida del archivo: "${valor}"`
    );
  }

  return fecha;
};

// ======================================================
// DETERMINAR SI TIENE RECHAZO
// ======================================================

const tieneValorRechazo = (valor) => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return false;
  }

  const texto = String(valor).trim();

  return texto !== "" && texto !== "0";
};

const tieneRechazo = (detalle) => {
  return (
    tieneValorRechazo(detalle.rechazo1) ||
    tieneValorRechazo(detalle.rechazo2) ||
    tieneValorRechazo(
      detalle.codigo_error_debito
    )
  );
};

// ======================================================
// OBTENER CÓDIGO DE RECHAZO
// ======================================================

const obtenerCodigoRechazo = (detalle) => {
  if (
    tieneValorRechazo(detalle.rechazo1)
  ) {
    return String(
      detalle.rechazo1
    ).trim();
  }

  if (
    tieneValorRechazo(detalle.rechazo2)
  ) {
    return String(
      detalle.rechazo2
    ).trim();
  }

  if (
    tieneValorRechazo(
      detalle.codigo_error_debito
    )
  ) {
    return String(
      detalle.codigo_error_debito
    ).trim();
  }

  return null;
};

// ======================================================
// PROCESAR ARCHIVO
// ======================================================

const procesarArchivo = async (archivo) => {
  const client = await pool.connect();

  const nombreArchivo = archivo.originalname;
  const rutaArchivo = archivo.path;

  try {
    // ==================================================
    // FECHA DE PAGO
    // ==================================================

    const fechaPago =
      obtenerFechaPago(nombreArchivo);

    // ==================================================
    // IDENTIDAD EDUCATIVA
    // ==================================================

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

    // ==================================================
    // CONFIGURACIÓN
    // ==================================================

    const configuracion =
      await obtenerConfiguracionFacturacion(
        identidadEducativa
      );

    // ==================================================
    // BEGIN
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
    // CARGAR ARCHIVO
    // ==================================================

    for await (const linea of rl) {
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

    // ==================================================
    // EJECUTAR AFECTACIÓN
    // ==================================================

    await client.query(
      `
        SELECT
          public.spafectacionarchivodebitorutaarchivo($1)
      `,
      [nombreArchivo]
    );

    // ==================================================
    // NOMBRE SIN .TXT
    // ==================================================

    const nombreArchivoSinExtension =
      nombreArchivo.replace(
        /\.txt$/i,
        ""
      );

    // ==================================================
    // OBTENER DETALLES
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
          ORDER BY
            id_archivo_respuesta_detalle
        `,
        [nombreArchivoSinExtension]
      );

    // ==================================================
    // CONTADORES
    // ==================================================

    let cantidadTransacciones = 0;
    let cantidadFacturas = 0;
    let cantidadRechazos = 0;

    let afectadosExitosamente = 0;
    let noAfectados = 0;

    // ==================================================
    // RESUMEN DE RECHAZOS
    // ==================================================

    const resumenRechazos = {};

    // ==================================================
    // PROCESAR DETALLES
    // ==================================================

    for (
      const detalle
      of resultadoDetalles.rows
    ) {
      // ==================================================
      // DETERMINAR RECHAZO
      // ==================================================

      const rechazado =
        tieneRechazo(detalle);

      const codigoError =
        obtenerCodigoRechazo(
          detalle
        );

      const descripcionError =
        String(
          detalle.descripcion_error_debito ?? ""
        ).trim();

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
      // CONTADOR DE RECHAZOS
      // ==================================================

      if (rechazado) {
        cantidadRechazos++;
        noAfectados++;

        const codigo =
          codigoError || "SIN_CODIGO";

        const descripcion =
          descripcionError ||
          "Sin descripción";

        const clave =
          `${codigo}|${descripcion}`;

        if (
          !resumenRechazos[clave]
        ) {
          resumenRechazos[clave] = {
            codigo,
            descripcion,
            cantidad: 0,
          };
        }

        resumenRechazos[clave].cantidad++;
      }

      // ==================================================
      // IMPORTE
      // ==================================================

      const importe =
        rechazado
          ? 0
          : convertirImporte(
              detalle.importe
            );

      // ==================================================
      // CONVERTIR FECHAS
      // ==================================================

      const fechaPresentacion =
        convertirFecha(
          detalle.fecha_presentacion
        );

      const fechaRespuestaPrisma =
        convertirFecha(
          detalle.fecha_devolucion_respuesta
        );

      // ==================================================
      // DATOS FACTURA
      // ==================================================

      let cae = null;
      let vencimientoCae = null;
      let comprobanteNumero = null;
      let puntoVenta = null;
      let comprobanteTipo = null;

      // ==================================================
      // FACTURAR SOLAMENTE ACEPTADOS
      // ==================================================

      if (
        !rechazado &&
        configuracion.debeFacturar
      ) {
        // ----------------------------------------------
        // OBTENER TUTOR
        // ----------------------------------------------

        const datosTutor =
          await obtenerDatosTutor(
            client,
            detalle.id_alumno
          );

        // ----------------------------------------------
        // DATOS ARCA
        // ----------------------------------------------

        puntoVenta =
          configuracion.puntoVenta;

        comprobanteTipo =
          configuracion.tipoComprobante;

        // ----------------------------------------------
        // VALIDAR DOCUMENTO
        // ----------------------------------------------

        if (
          !datosTutor ||
          !datosTutor.docTipoAfip ||
          !datosTutor.docNro
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
                datosTutor.docTipoAfip
              ),

            docNro:
              Number(
                datosTutor.docNro
              ),

            impTotal:
              importe,

            impNeto:
              importe,

            impIva: 0,

            condicionIvaReceptorId:
              configuracion.condicionIvaReceptorId,
          });

        // ----------------------------------------------
        // DATOS ARCA
        // ----------------------------------------------

        cae =
          datosAfip?.cae ??
          null;

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
      }

      // ==================================================
      // ARMAR BODY
      // ==================================================

      const importePago =
        rechazado
          ? 0
          : -importe;

      const valorRechazo =
        (valor, codigoError) => {
          const v =
            String(
              valor ?? ""
            ).trim();

          if (
            v !== "" &&
            v !== "0"
          ) {
            return v;
          }

          const c =
            String(
              codigoError ?? ""
            ).trim();

          if (
            c !== "" &&
            c !== "0"
          ) {
            return c;
          }

          return 0;
        };

      const body = {
        id_alumno_cc:
          detalle.id_alumno_cc,

        id_alumno:
          detalle.id_alumno,

        fecha_transaccion:
          new Date(),

        id_estado_cuota:
          rechazado
            ? 4
            : 3,

        // Aceptado: negativo
        // Rechazado: 0
        importe:
          importePago,

        fechaPago:
          fechaPago,

        fecha_ultima_modificacion:
          new Date(),

        fecha_respuesta_prisma:
          detalle.fecha_respuesta_prisma ||
          null,

        usuario:
          detalle.usuario_alta ||
          null,

        numero_comprobante:
          convertirNumero(
            detalle.numero_comprobante
          ),

        nroLote:
          convertirNumero(
            detalle.numero_lote
          ),

        nroAutorizacion:
          convertirNumero(
            detalle.numero_codigo_banco_pagador
          ),

        id_medio_pago:
          id_medio_pago ||
          null,

        id_marca_tarjeta:
          id_marca_tarjeta,

        // ==========================================
        // DATOS DEL RECHAZO
        // ==========================================

        id_motivo_rechazo1:
          rechazado
            ? valorRechazo(
                detalle.rechazo1,
                codigoError
              )
            : 0,

        id_motivo_rechazo2:
          rechazado
            ? valorRechazo(
                detalle.rechazo2,
                codigoError
              )
            : 0,

        codigo_error_debito:
          rechazado
            ? detalle.codigo_error_debito
            : null,

        descripcion_error_debito:
          rechazado
            ? detalle.descripcion_error_debito
            : null,

        // ==========================================
        // ARCA
        // ==========================================

        punto_venta:
          rechazado
            ? null
            : puntoVenta,

        comprobante_tipo:
          rechazado
            ? null
            : comprobanteTipo,

        comprobante_numero:
          rechazado
            ? null
            : comprobanteNumero,

        importe_actualizado:
          false,

        fecha_actualizacion_importe:
          null,

        notificado_rechazo:
          false,

        fecha_notificacion_rechazo:
          null,

        notificado_whatsapp:
          false,

        fecha_notificacion_whatsapp:
          null,

        notificado_mail:
          false,

        fecha_notificacion_mail:
          null,

        // ==========================================
        // CAE
        // ==========================================

        cae: cae,
      };

      // ==================================================
      // CREAR TRANSACCION
      // ==================================================

      await pagosService.createPagoCuota(
        body
      );

      cantidadTransacciones++;

      // ==================================================
      // CONTAR AFECTACIÓN EXITOSA
      // ==================================================

      if (!rechazado) {
        afectadosExitosamente++;
      }

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
    }

    // ==================================================
    // COMMIT
    // ==================================================

    await client.query("COMMIT");

    // ==================================================
    // ARMAR RESUMEN
    // ==================================================

    const rechazos =
      Object.values(
        resumenRechazos
      );

    // ==================================================
    // RESPUESTA
    // ==================================================

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

      rechazos:
        cantidadRechazos,

      debeFacturar:
        configuracion.debeFacturar,

      mensaje:
        "Archivo procesado correctamente",

      // ==================================================
      // RESUMEN PARA EL FRONTEND
      // ==================================================

      resumen: {
        totalRegistros:
          resultadoDetalles.rows.length,

        afectadosExitosamente:
          afectadosExitosamente,

        noAfectados:
          noAfectados,

        rechazos:
          rechazos,
      },
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

// ======================================================
// EXPORT
// ======================================================

export {
  procesarArchivo
};