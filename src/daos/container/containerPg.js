//import { pgDatabase } from '../db/pgClient.js';
import {pool} from '../../daos/db/pgClient.js'
import { format } from 'date-fns';


class ContainerPg{
 

   
    //ACTUALIZA DATOS DE UNA PERSONA 
    async updatePersons(objeto, id){

        if (objeto.es_alumno === "S")
            objeto.usuario = null

        try {
            await pool.query('BEGIN'); 
            const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const objetoBuscado = (await pool.query(`update persona set apellidos = $2, nombres = $3, fecha_nacimiento = $4, id_localidad_nacimiento = $5, id_localidad_residencia = $6, id_nacionalidad = $7, correo_electronico = $8, activo = $9, es_alumno = $10, usuario = $11, recibe_notif_x_correo = $12, telefono = $13, fecha_ultima_modificacion = $14, usuario_ultima_modificacion = $15 where id_persona=$1`, [id, objeto.apellidos, objeto.nombres, objeto.fecha_nacimiento, objeto.id_localidad_nacimiento, objeto.id_localidad_residencia, objeto.id_nacionalidad, objeto.correo_electronico, objeto.activo, objeto.es_alumno, objeto.usuario, objeto.recibe_notif_x_correo, objeto.telefono, fechaActual, objeto.usuario_sistema ]))
            const objetoBuscado2 = (await pool.query(`update persona_sexo set id_sexo = $2, usuario_ultima_modificacion = $3, fecha_ultima_modificacion = $4 where id_persona=$1`, [id, objeto.id_sexo, objeto.usuario_sistema, fechaActual]))
            await pool.query('COMMIT'); 
            return objetoBuscado, objetoBuscado2;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
    }

        //ACTUALIZA EL ESTADO DE UNA PERSONA (ELIMINA) 
    async updatePersonsEstado(objeto){
        try {
            await pool.query('BEGIN'); 
            const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const objetoBuscado = (await pool.query(`update persona set activo = $2, fecha_ultima_modificacion = $3, usuario_ultima_modificacion = $4 where id_persona=$1`, [objeto.id, 'B', fechaActual, objeto.usuario_sistema]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
    }

        async getAll(){
        try {
            const objetoBuscado = (await pool.query(` SELECT * FROM (
            SELECT DISTINCT ON (persona.id_persona) 
                persona.*, 
                persona_tipo_documento.id_tipo_documento, 
                persona_tipo_documento.numero, 
                td.nombre_corto,
                alumno.id_alumno,
                regular,
                motivo_desercion.nombre AS motivo_desercion -- <-- Se agrega el campo nombre asignándole un alias claro
            FROM persona 
            INNER JOIN persona_tipo_documento ON persona.id_persona = persona_tipo_documento.id_persona 
            INNER JOIN tipo_documento td ON td.id_tipo_documento = persona_tipo_documento.id_tipo_documento
            LEFT JOIN alumno ON alumno.id_persona = persona.id_persona
            LEFT JOIN motivo_desercion ON motivo_desercion.id_motivo_desercion = alumno.id_motivo_desercion -- <-- LEFT JOIN agregado
            WHERE persona.activo <> 'B' 
            ORDER BY 
                persona.id_persona, 
                CASE WHEN persona_tipo_documento.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, 
                persona_tipo_documento.fecha_alta ASC
        ) subconsulta 
        ORDER BY apellidos ASC, nombres ASC; `))
            return objetoBuscado.rows;
        }
        catch(error){
            throw error
        } 
    }

        async getAllById(id){
        try {
            const objetoBuscado = (await pool.query(`select persona.*, persona_sexo.id_sexo from persona, persona_sexo where persona.id_persona = persona_sexo.id_persona and persona.id_persona=$1`, [id]))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }
 

    async getAllAlumnosById(id, id_establecimiento){
        try {
            const objetoBuscado = (await pool.query(`select persona.*, alumno.* from persona, alumno where persona.id_persona = alumno.id_persona and persona.id_persona=$1 and alumno.id_establecimiento=$2`, [id, id_establecimiento]))

            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

        async getAllByApellidos(apellido){
        const apellidosconcomodin = `${apellido}%`

        try {

            //const objetoBuscado = (await pool.query(`select * from persona where activo <> 'B' and apellidos ILIKE $1`, [apellidosconcomodin]))   

            const objetoBuscado = (await pool.query(`  SELECT * FROM (
            SELECT DISTINCT ON (persona.id_persona) 
                persona.*, 
                persona_tipo_documento.id_tipo_documento, 
                persona_tipo_documento.numero, 
                td.nombre_corto,
                alumno.id_alumno,
                regular,
                motivo_desercion.nombre AS motivo_desercion -- <-- Se agrega el campo nombre asignándole un alias claro
            FROM persona 
            INNER JOIN persona_tipo_documento ON persona.id_persona = persona_tipo_documento.id_persona 
            INNER JOIN tipo_documento td ON td.id_tipo_documento = persona_tipo_documento.id_tipo_documento
            LEFT JOIN alumno ON alumno.id_persona = persona.id_persona
            LEFT JOIN motivo_desercion ON motivo_desercion.id_motivo_desercion = alumno.id_motivo_desercion -- <-- LEFT JOIN agregado
            WHERE persona.activo <> 'B'  and apellidos ILIKE $1
            ORDER BY 
                persona.id_persona, 
                CASE WHEN persona_tipo_documento.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, 
                persona_tipo_documento.fecha_alta ASC
        ) subconsulta 
        ORDER BY apellidos ASC, nombres ASC;  `, [apellidosconcomodin]));   

            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

    async getLocalidades(){
        try {
            const objetoBuscado = (await pool.query(`select * from localidad`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }

        async getDesercion(){
        try {
            const objetoBuscado = (await pool.query(`select * from motivo_desercion`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }
    
        async getNacionalidades(){
        try {
            const objetoBuscado = (await pool.query(`select * from nacionalidad`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

      async getDocumentos(){
        try {
            const objetoBuscado = (await pool.query(`select * from tipo_documento order by jerarquia`))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

     
    async getDocumentosPersona(id){
        try {
            const objetoBuscado = (await pool.query(`select * from persona_tipo_documento where id_persona = $1`, [id]))
            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
     }

    async actualizarDocumentoPersona(objeto){
        try {
            await pool.query('BEGIN'); 
            const objetoBuscado = (await pool.query(`update persona_tipo_documento set id_tipo_documento = $2, numero = $3, activo = $4 where id_persona_tipo_documento=$1`, [objeto.id_persona_tipo_documento, objeto.id_tipo_documento, objeto.numero, objeto.activo]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

    async eliminarDocumentoPersona(id){
        try {
            await pool.query('BEGIN'); 
            const objetoBuscado = (await pool.query(`delete from persona_tipo_documento where id_persona_tipo_documento=$1`, [id]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

    async registrarDocumentoPersona(objeto){

        // Formato estándar de base de datos sin offset de zona horaria
        const fecha_alta = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // Resultado: "2026-05-25 14:20:00"
    
        const query = `
        INSERT INTO persona_tipo_documento (
            id_persona, id_tipo_documento, numero, activo, 
            fecha_alta, usuario_alta
        ) 
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
        `;

       const valores = [
        objeto.id_persona, 
        objeto.id_tipo_documento, 
        objeto.numero, 
        objeto.activo, 
        fecha_alta,  //LOCALTIMESTAMP,                  // Fecha alta
        objeto.usuario_sistema              // Usuario alta
       ];


        try {
            await pool.query('BEGIN'); 
            const resultado = await pool.query(query, valores); 
            await pool.query('COMMIT'); 
            return resultado.rows;

        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
     }

        //ALTA
    async createPerson(objeto){
        // Formato estándar de base de datos sin offset de zona horaria
        const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // Resultado: "2026-05-25 14:20:00"
    
        const query = `
        INSERT INTO persona (
            apellidos, nombres, fecha_nacimiento, id_localidad_nacimiento, 
            id_localidad_residencia, id_nacionalidad, correo_electronico, activo, 
            es_alumno, usuario, recibe_notif_x_correo, telefono, 
            fecha_alta, usuario_alta, fecha_ultima_modificacion, usuario_ultima_modificacion
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
        `;

        const querysexo = `
        INSERT INTO persona_sexo (
            id_persona, id_sexo, activo, 
            fecha_alta, usuario_alta, fecha_ultima_modificacion, usuario_ultima_modificacion
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
        `;

        
        const valores = [
        objeto.apellidos, 
        objeto.nombres, 
        objeto.fecha_nacimiento, 
        parseInt(objeto.id_localidad_nacimiento), 
        parseInt(objeto.id_localidad_residencia), 
        parseInt(objeto.id_nacionalidad), 
        objeto.correo_electronico, 
        objeto.activo, 
        objeto.es_alumno, 
        objeto.usuario, 
        objeto.recibe_notif_x_correo, 
        objeto.telefono, 
        fechaActual,  //LOCALTIMESTAMP,                  // Fecha alta
        objeto.usuario_sistema,              // Usuario alta
        fechaActual, //LOCALTIMESTAMP,                  // Fecha modif
        objeto.usuario_sistema               // Usuario modif
        ];

try {
    console.log("Intentando ejecutar la consulta con los valores:", valores);
    
    await pool.query('BEGIN'); 
    
    // 1. Insertar la persona
    const resultado = await pool.query(query, valores); 
    const personaCreada = resultado.rows[0]; // Aquí está el id_persona generado

    // 2. Preparar valores e insertar el sexo usando el id recién obtenido
    const valoressexo = [
        personaCreada.id_persona, // 🌟 Id correcto obtenido del RETURNING *
        objeto.id_sexo, 
        'S', 
        fechaActual,
        objeto.usuario_sistema,
        fechaActual,
        objeto.usuario_sistema 
    ];

    const resultadosexo = await pool.query(querysexo, valoressexo); 
    
    await pool.query('COMMIT'); 

    console.log("Datos que Postgres dice haber guardado:", personaCreada);
    
    // 🌟 CORREGIDO: Devolvemos la fila completa de la persona. 
    // Al llevar 'id_persona', el frontend lo leerá automáticamente.
    return personaCreada; 

} catch (error) {
    await pool.query('ROLLBACK'); 
    console.error("❌ Error al insertar en Postgres:", error);
    throw error; 
}

   }  


        //ALTA
    async createAlumno(objeto){
        // Formato estándar de base de datos sin offset de zona horaria
       // const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
        // Resultado: "2026-05-25 14:20:00"

        if (objeto.regular === "S")
            objeto.id_motivo_desercion = null
        else
            objeto.id_motivo_desercion = parseInt(objeto.id_motivo_desercion)


       const query = `
        INSERT INTO alumno (
            id_persona, legajo, extranjero, regular, 
            id_motivo_desercion, es_celiaco, direccion_calle, direccion_numero, 
            direccion_piso, direccion_depto, id_medio_pago_inscripcion, paga_inscripcion_en_cuotas, 
            id_establecimiento
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
        `;

       
        const valores = [
        objeto.id_persona, 
        objeto.legajo, 
        objeto.extranjero, 
        objeto.regular,
        objeto.id_motivo_desercion, 
        objeto.es_celiaco,
        objeto.direccion_calle, 
        objeto.direccion_numero, 
        objeto.direccion_piso, 
        objeto.direccion_depto, 
        null, //parseInt(objeto.id_medio_pago_inscripcion), 
        'N', //objeto.paga_inscripcion_en_cuotas, 
        parseInt(objeto.id_establecimiento)
        ];

try {
    console.log("Intentando ejecutar la consulta con los valores:", valores);
    
    await pool.query('BEGIN'); 
    
    // 1. Insertar el alumno
    const resultado = await pool.query(query, valores); 
    const alumnoCreado = resultado.rows[0]; // Aquí está el id_alumno generado
  
    await pool.query('COMMIT'); 

    console.log("Datos que Postgres dice haber guardado:", alumnoCreado);
    
    // 🌟 CORREGIDO: Devolvemos la fila completa de la persona. 
    // Al llevar 'id_persona', el frontend lo leerá automáticamente.
    return alumnoCreado; 

} catch (error) {
    await pool.query('ROLLBACK'); 
    console.error("❌ Error al insertar en Postgres:", error);
    throw error; 
}

   }  
   

       //ACTUALIZA DATOS DE UNA PERSONA 
    async updateAlumnos(objeto){

          if (objeto.regular === "S")
            objeto.id_motivo_desercion = null

        try {
            await pool.query('BEGIN'); 
           // const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
            const resultadoBusqueda = (await pool.query(`select id_alumno from alumno where id_persona=$1 and id_establecimiento=$2`, [objeto.id_persona, objeto.id_establecimiento]))

            // Verificamos si el alumno existe antes de continuar
        if (resultadoBusqueda.rows.length === 0) {
            console.log("No se encontró el alumno. Cancelando operación.");
            await pool.query('ROLLBACK'); // Cancelamos la transacción
            return null;
        }

            const id_alumno = resultadoBusqueda.rows[0].id_alumno;
            
            const objetoBuscado = (await pool.query(`update alumno set legajo = $2, extranjero = $3, regular = $4, id_motivo_desercion = $5, es_celiaco = $6, direccion_calle = $7, direccion_numero = $8, direccion_piso = $9, direccion_depto = $10 where id_alumno=$1`, [id_alumno, objeto.legajo, objeto.extranjero, objeto.regular, objeto.id_motivo_desercion, objeto.es_celiaco, objeto.direccion_calle, objeto.direccion_numero, objeto.direccion_piso, objeto.direccion_depto ]))
            await pool.query('COMMIT'); 
            return objetoBuscado;
        }
        catch(error){
            await pool.query('ROLLBACK'); 
            return error
        } 
    }



  async getAlumnosPorUsuario(usuario) {
    try {
        
      const objetoBuscado = await pool.query(
        `SELECT  P.id_persona, 
            CONCAT(P.apellidos, ' ', P.nombres) AS Tutor,  P.usuario,
            a.id_alumno, a.legajo, 
            CONCAT(PAlumno.apellidos, ' ', PAlumno.nombres) AS NombreAlumno
        FROM Persona P
        INNER JOIN persona_allegado pa ON pa.id_persona = P.id_persona
        INNER JOIN alumno A ON  A.id_alumno = pa.id_alumno
                            AND A.Regular = 'S'	
        INNER JOIN persona PAlumno ON PAlumno.id_persona = a.id_persona
        WHERE pa.tutor = 'S' AND pa.activo = 'S'
        AND P.activo = 'S' AND P.es_alumno = 'N'
        AND p.usuario = $1
        `,
        [usuario],
      );
      return objetoBuscado.rows;
    } catch (error) {
      throw error;
    }
  }

  async getSaldosPorAlumno(id) {
    try {
      const objetoBuscado = await pool.query(
        `SELECT  g.nombre AS Grado,  CONCAT(p.apellidos, ' ', p.nombres) AS NombreAlumno, a.legajo
            , RIGHT(acc.cuota, 4) AS Anio, LEFT(acc.cuota, 2) AS Cuota,
                    CONCAT(CASE WHEN LEFT(acc.cuota, 2) = '01' then 'ENERO' 
                        WHEN LEFT(acc.cuota, 2) = '02' then 'FEBRERO'
                        WHEN LEFT(acc.cuota, 2) = '03' then 'MARZO'
                        WHEN LEFT(acc.cuota, 2) = '04' then 'ABRIL'
                        WHEN LEFT(acc.cuota, 2) = '05' then 'MAYO'
                        WHEN LEFT(acc.cuota, 2) = '06' then 'JUNIO'
                        WHEN LEFT(acc.cuota, 2) = '07' then 'JULIO'
                        WHEN LEFT(acc.cuota, 2) = '08' then 'AGOSTO'
                        WHEN LEFT(acc.cuota, 2) = '09' then 'SEPTIEMBRE'
                        WHEN LEFT(acc.cuota, 2) = '10' then 'OCTUBRE'
                        WHEN LEFT(acc.cuota, 2) = '11' then 'NOVIEMBRE'
                        WHEN LEFT(acc.cuota, 2) = '12' then 'DICIEMBRE' 
                        WHEN RIGHT(acc.cuota, 4) = ''  then ' MATERIALES '
                        WHEN LENGTH(acc.cuota) = 4     then 'PAGO INSCRIPCIÓN '
                        END, case when RIGHT(acc.cuota, 4) <> '' then ' DEL ' else '' end, right(acc.cuota, 4)) AS Anio_Cuota
                        , 
                    SUM(tcc.importe) AS SaldoCuota, SaldoTotal  
            FROM transaccion_cuenta_corriente tcc
            INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_Cc = tcc.id_alumno_cc
            INNER JOIN alumno a ON a.id_alumno = acc.id_alumno AND a.regular = 'S'
            LEFT JOIN alumno_tarjeta PT ON PT.Id_alumno = A.Id_alumno
            LEFT JOIN public.medio_pago mp ON pt.id_medio_pago = mp.id_medio_pago
            INNER JOIN persona p ON p.id_persona = a.id_persona
            INNER JOIN 
                (select id_alumno, sum(tc.importe) AS SaldoCuota
                from transaccion_cuenta_corriente tc
                inner join alumno_cuenta_corriente acc on acc.id_alumno_cc = tc.id_alumno_cc	
                group by id_alumno
                having  sum(tc.importe)> 0
                ) AS R1 ON R1.id_alumno = a.id_alumno
            INNER JOIN
                (select id_alumno, sum(tc.importe) AS SaldoTotal 
                from transaccion_cuenta_corriente tc
                inner join alumno_cuenta_corriente acc on acc.id_alumno_cc = tc.id_alumno_cc	
                group by id_alumno
                having  sum(tc.importe)> 0) as r2 on r2.id_alumno = a.id_alumno
            inner join
                (SELECT id_alumno, max(id_grado) as ultGrado
                FROM alumno_datos_cursada
                --where id_alumno =  272
                group by id_alumno) as adc on adc.id_alumno = r1.id_alumno
            inner join grado g on g.id_grado = adc.ultGrado
            WHERE  a.id_alumno = $1
            GROUP BY  g.nombre, p.apellidos, p.nombres, a.legajo, acc.id_alumno_cc, acc.cuota, SaldoTotal 
            --HAVING SUM(tcc.importe) > 0
            --ORDER BY  g.nombre, p.apellidos, p.nombres  --a.legajo
            ORDER BY  
                CASE 
                    WHEN g.nombre ILIKE 'Sala%' THEN 0
                    ELSE 1
                END,

                -- Orden dentro de "Sala de X"
                CASE 
                    WHEN g.nombre ILIKE 'Sala%' 
                    THEN CAST(REPLACE(g.nombre, 'Sala de ', '') AS INTEGER)
                END,

                -- Orden dentro de grados numéricos (1er, 2do, etc.)
                CASE 
                    WHEN g.nombre NOT ILIKE 'Sala%' 
                    THEN CAST(SUBSTRING(g.nombre FROM '^[0-9]+') AS INTEGER)
                END,

                p.apellidos,
                p.nombres;

        `,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      throw error;
    }
  }


    async getAlumnosPorId(id) {
    try {
        
      const objetoBuscado = await pool.query(
        `WITH AlumnoDocumentosPriorizados AS (
            SELECT  
                P.id_persona, 
                CONCAT(P.apellidos, ' ', P.nombres) AS nombre_tutor,
                P.usuario,
                a.id_alumno, 
                PAlumno.id_persona AS id_persona_alumno, -- <--- NUEVO: ID Persona del Alumno
                a.legajo, 
                CONCAT(PAlumno.apellidos, ' ', PAlumno.nombres) AS NombreAlumno,
                ta.nombre AS tipo_allegado_nombre,
                pa.tutor AS es_tutor,
                pa.activo,
                td.id_tipo_documento,
                td.numero,
                tdoc.nombre_corto,
                -- Particionamos por el ID del alumno para obtener 1 documento por cada alumno
                ROW_NUMBER() OVER (
                    PARTITION BY a.id_alumno 
                    ORDER BY 
                        CASE WHEN td.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC,
                        td.id_persona_tipo_documento ASC
                ) AS rn
            FROM Persona P
            INNER JOIN persona_allegado pa ON pa.id_persona = P.id_persona
            INNER JOIN alumno A ON A.id_alumno = pa.id_alumno AND A.Regular = 'S'    
            INNER JOIN tipo_allegado ta ON pa.id_tipo_allegado = ta.id_tipo_allegado
            INNER JOIN persona PAlumno ON PAlumno.id_persona = a.id_persona
            -- JOIN con los documentos DEL ALUMNO (PAlumno):
            INNER JOIN persona_tipo_documento td ON PAlumno.id_persona = td.id_persona
            INNER JOIN tipo_documento tdoc ON td.id_tipo_documento = tdoc.id_tipo_documento
            WHERE pa.activo = 'S'
            AND P.activo = 'S' 
            AND P.es_alumno = 'N'
            AND P.id_persona = $1
        )
        SELECT 
            id_persona,
            nombre_tutor AS "Tutor",
            usuario,
            id_alumno,
            id_persona_alumno,     -- ID Persona del Alumno
            legajo,
            NombreAlumno,
            tipo_allegado_nombre AS nombre,
            es_tutor AS tutor,
            activo,
            id_tipo_documento,
            numero,
            nombre_corto
        FROM AlumnoDocumentosPriorizados
        WHERE rn = 1;
        `,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
// 🌟 INTERCEPTAMOS EL ERROR DE NODE: Creamos un error de texto plano estático
      // Esto evita que pg-pool intente leer el stack trace roto de la librería
      const mensajeSeguro = error && error.message ? error.message : "Error inesperado en consulta SQL";
      throw new Error(`[DB Error] ${mensajeSeguro}`);
    }
  }


     async getTutoresPorId(id) {
    try {
        
      const objetoBuscado = await pool.query(
        `WITH AlumnoDocumentosPriorizados AS (
            SELECT  
                P.id_persona, 
                CONCAT(P.apellidos, ' ', P.nombres) AS nombre_tutor,
                P.usuario,
                ea.nombre AS nivel_estudio_tutor,     -- Nivel de estudio del tutor
                o.nombre AS ocupacion_tutor,          -- Ocupación del tutor
                a.id_alumno, 
                PAlumno.id_persona AS id_persona_alumno,
                a.legajo, 
                CONCAT(PAlumno.apellidos, ' ', PAlumno.nombres) AS NombreAlumno,
                ta.nombre AS tipo_allegado_nombre,
                pa.tutor AS es_tutor,
                pa.activo,
                td.id_tipo_documento,
                td.numero,
                tdoc.nombre_corto,
                -- Particionamos por el ID del tutor para obtener 1 documento por cada TUTOR de este alumno
                ROW_NUMBER() OVER (
                    PARTITION BY P.id_persona 
                    ORDER BY 
                        CASE WHEN td.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC,
                        td.id_persona_tipo_documento ASC
                ) AS rn
            FROM Persona P
            INNER JOIN persona_allegado pa ON pa.id_persona = P.id_persona
            INNER JOIN alumno A ON A.id_alumno = pa.id_alumno AND A.Regular = 'S'    
            INNER JOIN tipo_allegado ta ON pa.id_tipo_allegado = ta.id_tipo_allegado
            INNER JOIN persona PAlumno ON PAlumno.id_persona = a.id_persona
            -- JOIN con los documentos DEL TUTOR (P):
            INNER JOIN persona_tipo_documento td ON P.id_persona = td.id_persona
            INNER JOIN tipo_documento tdoc ON td.id_tipo_documento = tdoc.id_tipo_documento
            -- Nuevos JOINs para Estudio y Ocupación:
            LEFT JOIN estudio_alcanzado ea ON pa.id_estudio_alcanzado = ea.id_estudio_alcanzado  
            LEFT JOIN ocupacion o ON pa.id_ocupacion = o.id_ocupacion                        
            WHERE pa.activo = 'S'
            AND P.activo = 'S' 
            AND P.es_alumno = 'N'
            -- CAMBIO AQUÍ: Filtramos por el id_persona del ALUMNO
            AND PAlumno.id_persona = $1
        )
        SELECT 
            id_persona,
            nombre_tutor || ' - ' || nombre_corto || ': ' || numero AS "Tutor",
            usuario,
            nivel_estudio_tutor,
            ocupacion_tutor,
            id_alumno,
            id_persona_alumno,
            legajo,
            NombreAlumno,
            tipo_allegado_nombre AS nombre,
            es_tutor AS tutor,
            activo,
            id_tipo_documento,
            numero,
            nombre_corto
        FROM AlumnoDocumentosPriorizados
        WHERE rn = 1;
        `,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
// 🌟 INTERCEPTAMOS EL ERROR DE NODE: Creamos un error de texto plano estático
      // Esto evita que pg-pool intente leer el stack trace roto de la librería
      const mensajeSeguro = error && error.message ? error.message : "Error inesperado en consulta SQL";
      throw new Error(`[DB Error] ${mensajeSeguro}`);
    }
  }



async getAllByApellidosDocumento(apellidodocumento){
        const comodin = `${apellidodocumento}%`

        try {

            //const objetoBuscado = (await pool.query(`select * from persona where activo <> 'B' and apellidos ILIKE $1`, [apellidosconcomodin]))   

            const objetoBuscado = (await pool.query(`  SELECT * FROM (
            SELECT DISTINCT ON (persona.id_persona) 
                persona.*, 
                persona_tipo_documento.id_tipo_documento, 
                persona_tipo_documento.numero, 
                td.nombre_corto,
                alumno.id_alumno,
                regular,
                motivo_desercion.nombre AS motivo_desercion -- <-- Se agrega el campo nombre asignándole un alias claro
            FROM persona 
            INNER JOIN persona_tipo_documento ON persona.id_persona = persona_tipo_documento.id_persona 
            INNER JOIN tipo_documento td ON td.id_tipo_documento = persona_tipo_documento.id_tipo_documento
            LEFT JOIN alumno ON alumno.id_persona = persona.id_persona
            LEFT JOIN motivo_desercion ON motivo_desercion.id_motivo_desercion = alumno.id_motivo_desercion -- <-- LEFT JOIN agregado
            WHERE persona.activo <> 'B' and es_alumno = 'N'  and (apellidos ILIKE $1 or numero ILIKE $1)
            ORDER BY 
                persona.id_persona, 
                CASE WHEN persona_tipo_documento.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, 
                persona_tipo_documento.fecha_alta ASC
        ) subconsulta 
        ORDER BY apellidos ASC, nombres ASC;  `, [comodin]));   

            return objetoBuscado.rows;
        }
        catch(error){
            return error
        } 
    }


}  





 export {ContainerPg} ;
