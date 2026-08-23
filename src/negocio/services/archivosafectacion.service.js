import fs from "fs";
import readline from "readline";
import { pool } from "../../daos/db/pgClient.js";

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
// PROCESAR ARCHIVO
// ======================================================

const procesarArchivo = async (archivo) => {

  const client = await pool.connect();

  const nombreArchivo = archivo.originalname;
  const rutaArchivo = archivo.path;

  try {

    // ==================================================
    // DETERMINAR TABLA
    // ==================================================

    const tabla = obtenerTabla(nombreArchivo);

    if (!tabla) {
      throw new Error(
        `Archivo no reconocido: ${nombreArchivo}`
      );
    }

    console.log("=================================");
    console.log("PROCESAMIENTO DE ARCHIVO");
    console.log("Archivo:", nombreArchivo);
    console.log("Tabla:", tabla);
    console.log("=================================");


    // ==================================================
    // INICIAR TRANSACCIÓN
    // ==================================================

    await client.query("BEGIN");

    console.log("Transacción iniciada");


    // ==================================================
    // LIMPIAR TABLA TEMP
    // ==================================================

    await client.query(
      `DELETE FROM ${tabla}`
    );

    console.log(
      `Tabla ${tabla} limpiada`
    );


    // ==================================================
    // LEER ARCHIVO
    // ==================================================

    const stream = fs.createReadStream(
      rutaArchivo,
      {
        encoding: "utf8",
      }
    );

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity,
    });


    // ==================================================
    // INSERTAR CADA LÍNEA
    // ==================================================

    let cantidad = 0;

    for await (const linea of rl) {

      // Ignorar líneas vacías

      if (!linea.trim()) {
        continue;
      }


      await client.query(
        `
        INSERT INTO ${tabla}
        (contenido)
        VALUES ($1)
        `,
        [linea]
      );


      cantidad++;

    }


    console.log("=================================");
    console.log("CARGA DEL ARCHIVO FINALIZADA");
    console.log(
      "Cantidad insertada desde Node:",
      cantidad
    );
    console.log("=================================");


    // ==================================================
    // VERIFICAR QUE LOS REGISTROS EXISTEN
    // ==================================================

    const verificarTemp = await client.query(
      `
      SELECT
          COUNT(*) AS total,

          COUNT(*) FILTER (
              WHERE LEFT(contenido, 1) = '0'
          ) AS encabezados,

          COUNT(*) FILTER (
              WHERE LEFT(contenido, 1) = '1'
          ) AS detalles,

          COUNT(*) FILTER (
              WHERE LEFT(contenido, 1) = '9'
          ) AS finales

      FROM ${tabla}
      `
    );


    console.log("=================================");
    console.log("ESTADO REAL DE LA TABLA TEMP");
    console.log(
      verificarTemp.rows[0]
    );
    console.log("=================================");


    // ==================================================
    // MOSTRAR ALGUNOS REGISTROS
    // ==================================================

    const muestraTemp = await client.query(
      `
      SELECT
          LEFT(contenido, 100) AS contenido
      FROM ${tabla}
      LIMIT 5
      `
    );


    console.log("=================================");
    console.log("PRIMEROS REGISTROS DE LA TEMP");
    console.log(
      muestraTemp.rows
    );
    console.log("=================================");


    // ==================================================
    // VERIFICAR REGISTROS NO VACÍOS
    // ==================================================

    const verificarNoVacios = await client.query(
      `
      SELECT COUNT(*) AS cantidad
      FROM ${tabla}
      WHERE LTRIM(RTRIM(contenido)) <> ''
      `
    );


    console.log("=================================");
    console.log(
      "REGISTROS NO VACÍOS:",
      verificarNoVacios.rows[0].cantidad
    );
    console.log("=================================");


    // ==================================================
    // EJECUTAR FUNCIÓN DE AFECTACIÓN
    // ==================================================

    console.log("=================================");
    console.log("EJECUTANDO FUNCIÓN");
    console.log(
      "Función:",
      "spafectacionarchivodebitorutaarchivo"
    );
    console.log(
      "Parámetro:",
      nombreArchivo
    );
    console.log("=================================");


    const resultadoFuncion = await client.query(
      `
      SELECT *
      FROM public.spafectacionarchivodebitorutaarchivo($1)
      `,
      [nombreArchivo]
    );


    // ==================================================
    // MOSTRAR RESULTADO
    // ==================================================

    console.log("=================================");
    console.log("RESULTADO DE LA FUNCIÓN");
    console.log(
      "Filas devueltas:",
      resultadoFuncion.rows.length
    );
    console.log(
      "Datos:",
      resultadoFuncion.rows
    );
    console.log("=================================");


    // ==================================================
    // VERIFICAR RESULTADO
    // ==================================================

    if (resultadoFuncion.rows.length === 0) {

      throw new Error(
        "La función de afectación no devolvió ningún resultado."
      );

    }


    // ==================================================
    // COMMIT
    // ==================================================

    await client.query("COMMIT");

    console.log("=================================");
    console.log("TRANSACCIÓN CONFIRMADA");
    console.log("=================================");


    // ==================================================
    // RESULTADO FINAL
    // ==================================================

    return {

      ok: true,

      archivo: nombreArchivo,

      tabla: tabla,

      registros: cantidad,

      mensaje: "Archivo procesado correctamente",

      ...resultadoFuncion.rows[0],

    };


  } catch (error) {

    // ==================================================
    // ROLLBACK
    // ==================================================

    console.error("=================================");
    console.error("ERROR PROCESANDO ARCHIVO");
    console.error(error);
    console.error("=================================");


    try {

      await client.query("ROLLBACK");

      console.log(
        "ROLLBACK ejecutado correctamente"
      );

    } catch (rollbackError) {

      console.error(
        "Error ejecutando ROLLBACK:",
        rollbackError
      );

    }


    throw error;


  } finally {

    // ==================================================
    // LIBERAR CONEXIÓN
    // ==================================================

    client.release();


    // ==================================================
    // ELIMINAR ARCHIVO TEMPORAL
    // ==================================================

    if (fs.existsSync(rutaArchivo)) {

      fs.unlinkSync(rutaArchivo);

      console.log(
        "Archivo temporal eliminado:",
        rutaArchivo
      );

    }

  }

};


// ======================================================
// EXPORTAR
// ======================================================

export {
  procesarArchivo
};