import fs from "fs";
import readline from "readline";
import { pool } from "../../daos/db/pgClient.js";


// ======================================================
// DETERMINAR TABLA
// ======================================================

const obtenerTabla = (nombreArchivo) => {

    const nombre = nombreArchivo.toUpperCase();


    if (
        nombre.startsWith("LDEBLIQD") ||
        nombre.startsWith("RDEBLIQD")
    ) {
        return "temparchivoldebliqd";
    }


    if (
        nombre.startsWith("LDEBLIQC") ||
        nombre.startsWith("RDEBLIQC")
    ) {
        return "temparchivordebliqc";
    }


    if (
        nombre.startsWith("LDEBLIMC") ||
        nombre.startsWith("RDEBLIMC")
    ) {
        return "temparchivordeblimc";
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

        // ----------------------------------------------
        // Determinar tabla
        // ----------------------------------------------

        const tabla = obtenerTabla(nombreArchivo);


        if (!tabla) {

            throw new Error(
                `Archivo no reconocido: ${nombreArchivo}`
            );

        }


        console.log(
            `Procesando ${nombreArchivo}`
        );

        console.log(
            `Tabla destino: ${tabla}`
        );


        // ----------------------------------------------
        // Transacción
        // ----------------------------------------------

        await client.query("BEGIN");


        // ----------------------------------------------
        // Limpiar tabla
        // ----------------------------------------------

        await client.query(
            `DELETE FROM ${tabla}`
        );


        console.log(
            `Tabla ${tabla} limpiada`
        );


        // ----------------------------------------------
        // Leer archivo
        // ----------------------------------------------

        const stream = fs.createReadStream(
            rutaArchivo,
            {
                encoding: "utf8"
            }
        );


        const rl = readline.createInterface({
            input: stream,
            crlfDelay: Infinity
        });


        let cantidad = 0;


        // ----------------------------------------------
        // Procesar cada línea
        // ----------------------------------------------

        for await (const linea of rl) {

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


        // ----------------------------------------------
        // Confirmar
        // ----------------------------------------------

        await client.query("COMMIT");


        console.log(
            `Registros insertados: ${cantidad}`
        );


        return {
            archivo: nombreArchivo,
            tabla: tabla,
            registros: cantidad,
            mensaje: "Archivo procesado correctamente"
        };


    } catch (error) {

        // ----------------------------------------------
        // Rollback
        // ----------------------------------------------

        await client.query("ROLLBACK");

        throw error;


    } finally {

        client.release();


        // ----------------------------------------------
        // Eliminar archivo temporal
        // ----------------------------------------------

        if (fs.existsSync(rutaArchivo)) {

            fs.unlinkSync(rutaArchivo);

        }

    }

};


export {
    procesarArchivo
};