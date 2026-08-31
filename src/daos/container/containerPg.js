//import { pgDatabase } from '../db/pgClient.js';
import { pool } from "../../daos/db/pgClient.js";
import { format } from "date-fns";

class ContainerPg {
  //ACTUALIZA DATOS DE UNA PERSONA
  async updatePersons(objeto, id) {
    if (objeto.es_alumno === "S") objeto.usuario = null;

    try {
      await pool.query("BEGIN");
      const fechaActual = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const objetoBuscado = await pool.query(
        `update persona set apellidos = $2, nombres = $3, fecha_nacimiento = $4, id_localidad_nacimiento = $5, id_localidad_residencia = $6, id_nacionalidad = $7, correo_electronico = $8, activo = $9, es_alumno = $10, usuario = $11, recibe_notif_x_correo = $12, telefono = $13, fecha_ultima_modificacion = $14, usuario_ultima_modificacion = $15 where id_persona=$1`,
        [
          id,
          objeto.apellidos,
          objeto.nombres,
          objeto.fecha_nacimiento,
          objeto.id_localidad_nacimiento,
          objeto.id_localidad_residencia,
          objeto.id_nacionalidad,
          objeto.correo_electronico,
          objeto.activo,
          objeto.es_alumno,
          objeto.usuario,
          objeto.recibe_notif_x_correo,
          objeto.telefono,
          fechaActual,
          objeto.usuario_sistema,
        ],
      );
      const objetoBuscado2 = await pool.query(
        `update persona_sexo set id_sexo = $2, usuario_ultima_modificacion = $3, fecha_ultima_modificacion = $4 where id_persona=$1`,
        [id, objeto.id_sexo, objeto.usuario_sistema, fechaActual],
      );
      await pool.query("COMMIT");
      return (objetoBuscado, objetoBuscado2);
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  //ACTUALIZA EL ESTADO DE UNA PERSONA (ELIMINA)
  async updatePersonsEstado(objeto) {
    try {
      await pool.query("BEGIN");
      const fechaActual = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const objetoBuscado = await pool.query(
        `update persona set activo = $2, fecha_ultima_modificacion = $3, usuario_ultima_modificacion = $4 where id_persona=$1`,
        [objeto.id, "B", fechaActual, objeto.usuario_sistema],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async getAll() {
    try {
      const objetoBuscado = await pool.query(` SELECT * FROM (
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
        ORDER BY apellidos ASC, nombres ASC; `);
      return objetoBuscado.rows;
    } catch (error) {
      throw error;
    }
  }

  async getAllById(id) {
    try {
      const objetoBuscado = await pool.query(
        `select persona.*, persona_sexo.id_sexo from persona, persona_sexo where persona.id_persona = persona_sexo.id_persona and persona.id_persona=$1`,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getAllAlumnosById(id, id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `select persona.*, alumno.* from persona, alumno where persona.id_persona = alumno.id_persona and persona.id_persona=$1 and alumno.id_establecimiento=$2`,
        [id, id_establecimiento],
      );

      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getAllWithFilters(filtros = {}) {
    const { search, esAlumno, esTutor, estado } = filtros;

    // Condiciones base para el WHERE
    const conditions = ["persona.activo <> 'B'"];
    const params = [];

    // 1. Filtro por Texto Libre (Búsqueda por Nombre, Apellido o Número de Documento)
    if (search && search.trim() !== "") {
      params.push(`%${search.trim()}%`);
      const paramIndex = `$${params.length}`;

      // Busca concordancia en nombres, apellidos o número de documento
      conditions.push(`(
      persona.apellidos ILIKE ${paramIndex} OR 
      persona.nombres ILIKE ${paramIndex} OR 
      persona_tipo_documento.numero ILIKE ${paramIndex}
    )`);
    }
    // 3. Filtros por Rol
    if (String(esAlumno) === "true") {
      conditions.push(`alumno.id_alumno IS NOT NULL`);
    }

    if (String(esTutor) === "true") {
      conditions.push(`es_alumno = 'N'`);
    }

    // 4. Estado de Alumno (Comparamos con 'S' y 'N')
    if (String(esAlumno) === "true" && estado === "activo") {
      conditions.push(`alumno.regular = 'S'`);
    } else if (String(esAlumno) === "true" && estado === "pasivo") {
      conditions.push(`alumno.regular = 'N'`);
    }
    // Unimos todas las condiciones con AND
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    try {
      const query = `
     SELECT * FROM (
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
        ${whereClause}
            ORDER BY 
                persona.id_persona, 
                CASE WHEN persona_tipo_documento.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, 
                persona_tipo_documento.fecha_alta ASC
        ) subconsulta 
        ORDER BY apellidos ASC, nombres ASC; 
    `;

      const objetoBuscado = await pool.query(query, params);
      return objetoBuscado.rows;
    } catch (error) {
      console.error("Error en getAllWithFilters:", error);
      throw error;
    }
  }

  async getLocalidades() {
    try {
      const objetoBuscado = await pool.query(`select * from localidad`);
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getDesercion() {
    try {
      const objetoBuscado = await pool.query(`select * from motivo_desercion`);
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getNacionalidades() {
    try {
      const objetoBuscado = await pool.query(`select * from nacionalidad`);
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getDocumentos() {
    try {
      const objetoBuscado = await pool.query(
        `select * from tipo_documento order by jerarquia`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getOcupaciones() {
    try {
      const objetoBuscado = await pool.query(
        `select * from ocupacion order by id_ocupacion`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getEstudios() {
    try {
      const objetoBuscado = await pool.query(
        `select * from estudio_alcanzado order by id_estudio_alcanzado`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getTiposAllegado() {
    try {
      const objetoBuscado = await pool.query(
        `select * from tipo_allegado order by id_tipo_allegado`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getDocumentosPersona(id) {
    try {
      const objetoBuscado = await pool.query(
        `select * from persona_tipo_documento where id_persona = $1`,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

    async getMarcadores() {
    try {
      const objetoBuscado = await pool.query(`select * from marcadoresmapa`);
      console.log(objetoBuscado)
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }


  async actualizarDocumentoPersona(objeto) {
    try {
      await pool.query("BEGIN");
      const objetoBuscado = await pool.query(
        `update persona_tipo_documento set id_tipo_documento = $2, numero = $3, activo = $4 where id_persona_tipo_documento=$1`,
        [
          objeto.id_persona_tipo_documento,
          objeto.id_tipo_documento,
          objeto.numero,
          objeto.activo,
        ],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async eliminarDocumentoPersona(id) {
    try {
      await pool.query("BEGIN");
      const objetoBuscado = await pool.query(
        `delete from persona_tipo_documento where id_persona_tipo_documento=$1`,
        [id],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async registrarDocumentoPersona(objeto) {
    // Formato estándar de base de datos sin offset de zona horaria
    const fecha_alta = format(new Date(), "yyyy-MM-dd HH:mm:ss");
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
      fecha_alta, //LOCALTIMESTAMP,                  // Fecha alta
      objeto.usuario_sistema, // Usuario alta
    ];

    try {
      await pool.query("BEGIN");
      const resultado = await pool.query(query, valores);
      await pool.query("COMMIT");
      return resultado.rows;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  //ALTA
  async createPerson(objeto) {
    // Formato estándar de base de datos sin offset de zona horaria
    const fechaActual = format(new Date(), "yyyy-MM-dd HH:mm:ss");
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
      fechaActual, //LOCALTIMESTAMP,                  // Fecha alta
      objeto.usuario_sistema, // Usuario alta
      fechaActual, //LOCALTIMESTAMP,                  // Fecha modif
      objeto.usuario_sistema, // Usuario modif
    ];

    try {
      console.log("Intentando ejecutar la consulta con los valores:", valores);

      await pool.query("BEGIN");

      // 1. Insertar la persona
      const resultado = await pool.query(query, valores);
      const personaCreada = resultado.rows[0]; // Aquí está el id_persona generado

      // 2. Preparar valores e insertar el sexo usando el id recién obtenido
      const valoressexo = [
        personaCreada.id_persona, // 🌟 Id correcto obtenido del RETURNING *
        objeto.id_sexo,
        "S",
        fechaActual,
        objeto.usuario_sistema,
        fechaActual,
        objeto.usuario_sistema,
      ];

      const resultadosexo = await pool.query(querysexo, valoressexo);

      await pool.query("COMMIT");

      console.log("Datos que Postgres dice haber guardado:", personaCreada);

      // 🌟 CORREGIDO: Devolvemos la fila completa de la persona.
      // Al llevar 'id_persona', el frontend lo leerá automáticamente.
      return personaCreada;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("❌ Error al insertar en Postgres:", error);
      throw error;
    }
  }

  //ALTA
  async createAlumno(objeto) {
    // Formato estándar de base de datos sin offset de zona horaria
    // const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    // Resultado: "2026-05-25 14:20:00"

    if (objeto.regular === "S") objeto.id_motivo_desercion = null;
    else objeto.id_motivo_desercion = parseInt(objeto.id_motivo_desercion);

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
      "N", //objeto.paga_inscripcion_en_cuotas,
      parseInt(objeto.id_establecimiento),
    ];

    try {
      console.log("Intentando ejecutar la consulta con los valores:", valores);

      await pool.query("BEGIN");

      // 1. Insertar el alumno
      const resultado = await pool.query(query, valores);
      const alumnoCreado = resultado.rows[0]; // Aquí está el id_alumno generado

      await pool.query("COMMIT");

      console.log("Datos que Postgres dice haber guardado:", alumnoCreado);

      // 🌟 CORREGIDO: Devolvemos la fila completa de la persona.
      // Al llevar 'id_persona', el frontend lo leerá automáticamente.
      return alumnoCreado;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("❌ Error al insertar en Postgres:", error);
      throw error;
    }
  }

  //ACTUALIZA DATOS DE UNA PERSONA
  async updateAlumnos(objeto) {
    if (objeto.regular === "S") objeto.id_motivo_desercion = null;

    try {
      await pool.query("BEGIN");
      // const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      const resultadoBusqueda = await pool.query(
        `select id_alumno from alumno where id_persona=$1 and id_establecimiento=$2`,
        [objeto.id_persona, objeto.id_establecimiento],
      );

      // Verificamos si el alumno existe antes de continuar
      if (resultadoBusqueda.rows.length === 0) {
        console.log("No se encontró el alumno. Cancelando operación.");
        await pool.query("ROLLBACK"); // Cancelamos la transacción
        return null;
      }

      const id_alumno = resultadoBusqueda.rows[0].id_alumno;

      const objetoBuscado = await pool.query(
        `update alumno set legajo = $2, extranjero = $3, regular = $4, id_motivo_desercion = $5, es_celiaco = $6, direccion_calle = $7, direccion_numero = $8, direccion_piso = $9, direccion_depto = $10 where id_alumno=$1`,
        [
          id_alumno,
          objeto.legajo,
          objeto.extranjero,
          objeto.regular,
          objeto.id_motivo_desercion,
          objeto.es_celiaco,
          objeto.direccion_calle,
          objeto.direccion_numero,
          objeto.direccion_piso,
          objeto.direccion_depto,
        ],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async getAlumnosPorUsuario(usuario) {
    try {
      const objetoBuscado = await pool.query(
        `SELECT  P.id_persona, 
            CONCAT(P.apellidos, ' ', P.nombres) AS Tutor,  P.usuario,
            a.id_alumno, a.legajo, 
            CONCAT(PAlumno.apellidos, ' ', PAlumno.nombres) AS NombreAlumno,
            g.nombre AS Grado,
            CantCuotasAdeudadas, SaldoAdeudado
        FROM Persona P
        INNER JOIN persona_allegado pa ON pa.id_persona = P.id_persona
        INNER JOIN alumno A ON  A.id_alumno = pa.id_alumno
                            AND A.Regular = 'S'	
        INNER JOIN persona PAlumno ON PAlumno.id_persona = a.id_persona
        INNER JOIN
			 (SELECT id_alumno, max(id_grado) AS ultGrado
			FROM alumno_datos_cursada
			--where id_alumno =  272
			group by id_alumno) AS adc ON adc.id_alumno = a.id_alumno
		INNER JOIN grado g ON g.id_grado = adc.ultGrado
        INNER JOIN
        (SELECT
                    t.id_alumno,
                    COUNT(*) AS CantCuotasAdeudadas,
                    SUM(t.SaldoAdeudado) AS SaldoAdeudado
                FROM
                (
                    SELECT
                        acc.id_alumno,
                        acc.id_alumno_cc,
                        SUM(tc.importe) AS SaldoAdeudado
                    FROM alumno_cuenta_corriente acc
                    INNER JOIN transaccion_cuenta_corriente tc
                        ON tc.id_alumno_cc = acc.id_alumno_cc
                    GROUP BY
                        acc.id_alumno,
                        acc.id_alumno_cc
                    HAVING SUM(tc.importe) > 0
                ) t
                GROUP BY t.id_alumno) AS R1 ON R1.id_alumno = a.id_alumno
        WHERE  pa.activo = 'S'
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
        `SELECT  
    tcc.id_transaccion_cc, 
    acc.id_alumno_cc, 
    MAX(tcc.id_estado_cuota) AS id_estado_cuota, 
	MAX(ec.nombre) as estado_cuota,
    MAX(fecha_pago) AS fecha_pago, 
    MAX(fecha_respuesta_prisma) AS fecha_respuesta_prisma, 
    tcc.fecha_transaccion, 
    MAX(tcc.id_medio_pago) AS id_medio_pago, 
	MAX(mp.nombre) as medio_pago,
    MAX(tcc.id_marca_tarjeta) AS id_marca_tarjeta, 
    MAX(id_motivo_rechazo1) AS id_motivo_rechazo1, 
    MAX(id_motivo_rechazo2) AS id_motivo_rechazo2, 
    MAX(codigo_error_debito) AS codigo_error_debito, 
    MAX(descripcion_error_debito) AS descripcion_error_debito, 
    g.nombre AS Grado,  
    CONCAT(p.apellidos, ' ', p.nombres) AS NombreAlumno, 
    a.legajo,
    MAX(a.direccion_calle) || ' ' || MAX(a.direccion_numero) as direccion_alumno,
    MAX(tcc.numero_comprobante) AS numero_comprobante, 
    MAX(numero_lote) AS numero_lote, 
    MAX(numero_autorizacion) AS numero_autorizacion, 
    MAX(punto_venta) AS punto_venta, 
    MAX(comprobante_tipo) AS comprobante_tipo, 
    MAX(comprobante_numero) AS comprobante_numero,
	max(mt.nombre) as nombre_tarjeta,
    max(tcc.descripcion_error_debito) as motivo_rechazo,
    max(tcc.importe) as importe,
    max(tcc.CAE) as cae,
max(ee.entidadeducativa) as entidad_educativa,
max(ee.direccion) as direccion,
max(ee.numero) as numero,
max(ee.logo) as logo,
max(ee.cuit) as cuit_institucion,
max(persona_allegada) as persona_allegada,
max(loc.nombre) as localidad_nombre,
max(prov.nombre) as provincia_nombre,
max(cuit_tutor) as cuil_tutor, 		
max(id_tipo_documento_tutor) as id_tipo_documento_tutor, -- <--- AGREGAR AQUÍ
max(ingresos_brutos) as ingresos_brutos,
max(condicion_iva) as condicion_iva,
max(inicio_actividades) as inicio_actividades,

    		SUM(tcc.importe) AS SaldoCuota, SaldoTotal,
    -- Año: toma el año de generación para Materiales e Inscripción, o el año de acc.cuota para el resto
    CASE 
        WHEN UPPER(acc.descripcion) LIKE '%INSCRIP%' OR UPPER(acc.descripcion) LIKE '%MATERIAL%' 
            THEN TO_CHAR(acc.fecha_generacion_cc, 'YYYY')
        WHEN acc.cuota IS NULL OR TRIM(acc.cuota) = '' THEN SUBSTRING(acc.descripcion FROM 20 FOR 4)
        ELSE RIGHT(acc.cuota, 4)
    END AS Anio,

    -- Cuota: asigna '00_INS' o '00_MAT' para ordenarlos al inicio del año antes del mes 01
-- Cuota: Toma el mes de generación real para Materiales/Inscripción y le concatena un identificador
    CASE 
        WHEN UPPER(acc.descripcion) LIKE '%INSCRIP%' 
            THEN TO_CHAR(acc.fecha_generacion_cc, 'MM') || '_INS'
        WHEN UPPER(acc.descripcion) LIKE '%MATERIAL%' 
            THEN TO_CHAR(acc.fecha_generacion_cc, 'MM') || '_MAT'
        WHEN acc.cuota IS NULL OR TRIM(acc.cuota) = '' 
            THEN TO_CHAR(acc.fecha_generacion_cc, 'MM') || '_VAR'
        ELSE LEFT(acc.cuota, 2) 
    END AS Cuota,

    acc.descripcion AS Anio_Cuota,
    SUM(tcc.importe) AS SaldoCuota, 
    SaldoTotal  

FROM transaccion_cuenta_corriente tcc
INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tcc.id_alumno_cc
INNER JOIN alumno a ON a.id_alumno = acc.id_alumno AND a.regular = 'S'
LEFT JOIN alumno_tarjeta PT ON PT.Id_alumno = A.Id_alumno
LEFT JOIN marca_tarjeta mt ON tcc.id_marca_tarjeta = mt.id_marca_tarjeta
LEFT JOIN public.medio_pago mp ON tcc.id_medio_pago = mp.id_medio_pago
INNER JOIN public.estado_cuota ec ON tcc.id_estado_cuota = ec.id_estado_cuota
LEFT JOIN entidades_educativas ee ON ee.identidadeducativa = a.id_establecimiento
LEFT JOIN localidad loc ON ee.localidad = loc.id_localidad
LEFT JOIN provincia prov ON ee.provincia = prov.id_provincia
INNER JOIN (
    SELECT 
        id_establecimiento,
        MAX(CASE WHEN id_parametro = 18 THEN valor END) AS ingresos_brutos,
        MAX(CASE WHEN id_parametro = 22 THEN valor END) AS condicion_iva,
        MAX(CASE WHEN id_parametro = 19 THEN valor END) AS inicio_actividades
    FROM parametros_sistema 
    WHERE id_parametro IN (18, 22, 19)
    GROUP BY id_establecimiento
) AS param ON param.id_establecimiento = a.id_establecimiento
INNER JOIN persona p ON p.id_persona = a.id_persona
INNER JOIN (
    SELECT 
        pa.id_alumno,
        per.apellidos || ', ' || per.nombres AS persona_allegada,
        tipdoc.numero AS cuit_tutor,
        tipdoc.id_tipo_documento AS id_tipo_documento_tutor, -- <--- AGREGAR AQUÍ
        ROW_NUMBER() OVER (
            PARTITION BY pa.id_alumno 
            ORDER BY 
                CASE 
                    WHEN tipdoc.id_tipo_documento = 7 THEN 1 
                    WHEN tipdoc.id_tipo_documento = 8 THEN 2 
                    ELSE 3 
                END
        ) as orden
    FROM persona_allegado pa
    INNER JOIN persona per ON per.id_persona = pa.id_persona
    LEFT JOIN persona_tipo_documento tipdoc ON tipdoc.id_persona = pa.id_persona
) RP ON RP.id_alumno = a.id_alumno AND RP.orden = 1
INNER JOIN 
    (SELECT id_alumno, SUM(tc.importe) AS SaldoCuota
     FROM transaccion_cuenta_corriente tc
     INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tc.id_alumno_cc    
     GROUP BY id_alumno
     HAVING SUM(tc.importe) > 0
    ) AS R1 ON R1.id_alumno = a.id_alumno
INNER JOIN
    (SELECT id_alumno, SUM(tc.importe) AS SaldoTotal 
     FROM transaccion_cuenta_corriente tc
     INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tc.id_alumno_cc    
     GROUP BY id_alumno
     HAVING SUM(tc.importe) > 0) AS r2 ON r2.id_alumno = a.id_alumno
INNER JOIN
     (SELECT id_alumno, MAX(id_grado) AS ultGrado
      FROM alumno_datos_cursada
      GROUP BY id_alumno) AS adc ON adc.id_alumno = r1.id_alumno
INNER JOIN grado g ON g.id_grado = adc.ultGrado

WHERE a.id_alumno = $1

GROUP BY 
    tcc.id_transaccion_cc, 
    tcc.fecha_transaccion, 
    g.nombre, 
    p.apellidos, 
    p.nombres, 
    a.legajo, 
    acc.id_alumno_cc, 
    acc.cuota, 
    acc.descripcion,
    acc.fecha_generacion_cc,
    SaldoTotal  

ORDER BY 
    Anio,
    Cuota,
	tcc.id_transaccion_cc,
    tcc.fecha_transaccion ASC;


        `,
        [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      throw error;
    }
  }

  async getAlumnosPorId(id, id_establecimiento) {
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
            AND id_establecimiento = $2
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
        [id, id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      // 🌟 INTERCEPTAMOS EL ERROR DE NODE: Creamos un error de texto plano estático
      // Esto evita que pg-pool intente leer el stack trace roto de la librería
      const mensajeSeguro =
        error && error.message
          ? error.message
          : "Error inesperado en consulta SQL";
      throw new Error(`[DB Error] ${mensajeSeguro}`);
    }
  }

  async getTutoresPorId(id) {
    try {
      const objetoBuscado = await pool.query(
        `WITH AlumnoDocumentosPriorizados AS (
            SELECT  
                pa.id_persona_allegado,
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
            WHERE (pa.activo = 'S' OR pa.activo = 'N')
            AND P.activo = 'S'
            AND P.es_alumno = 'N'
            -- CAMBIO AQUÍ: Filtramos por el id_persona del ALUMNO
            AND PAlumno.id_persona = $1
        )
        SELECT 
            id_persona_allegado,
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
      const mensajeSeguro =
        error && error.message
          ? error.message
          : "Error inesperado en consulta SQL";
      throw new Error(`[DB Error] ${mensajeSeguro}`);
    }
  }

  async getAllByApellidosDocumento(apellidodocumento) {
    const comodin = `${apellidodocumento}%`;

    try {
      //const objetoBuscado = (await pool.query(`select * from persona where activo <> 'B' and apellidos ILIKE $1`, [apellidosconcomodin]))

      const objetoBuscado = await pool.query(
        `  SELECT * FROM (
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
        ORDER BY apellidos ASC, nombres ASC;  `,
        [comodin],
      );

      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  //ALTA
  async createPersonaAllegada(objeto) {
    // Formato estándar de base de datos sin offset de zona horaria
    // const fechaActual = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    // Resultado: "2026-05-25 14:20:00"
    //console.log("este es el DAO"  + objeto.usuario)
    const fechaActual = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const query = `
        INSERT INTO persona_allegado (
            id_persona, id_alumno, id_tipo_allegado, id_estudio_alcanzado, 
            id_ocupacion, tutor, activo, 
            fecha_alta, usuario_alta, fecha_ultima_modificacion, usuario_ultima_modificacion

        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
        `;

    const valores = [
      objeto.id_persona,
      objeto.id_alumno,
      objeto.id_tipo_allegado,
      objeto.id_estudio_alcanzado,
      objeto.id_ocupacion,
      objeto.tutor,
      objeto.activo,
      fechaActual,
      objeto.usuario_sistema,
      fechaActual,
      objeto.usuario_sistema,
    ];

    try {
      console.log("Intentando ejecutar la consulta con los valores:", valores);

      await pool.query("BEGIN");

      // 1. Insertar el alumno
      const resultado = await pool.query(query, valores);
      const allegadosCreado = resultado.rows[0]; // Aquí está el id_alumno generado

      await pool.query("COMMIT");

      console.log("Datos que Postgres dice haber guardado:", allegadosCreado);

      // 🌟 CORREGIDO: Devolvemos la fila completa de la persona.
      // Al llevar 'id_persona', el frontend lo leerá automáticamente.
      return allegadosCreado;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("❌ Error al insertar en Postgres:", error);
      throw error;
    }
  }

  async eliminarAllegado(id) {
    try {
      await pool.query("BEGIN");
      const objetoBuscado = await pool.query(
        `delete from persona_allegado where id_persona_allegado=$1`,
        [id],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async ExistePersona(tipo, numero) {
    try {
      if (!tipo || !numero) {
        return "Faltan parámetros de búsqueda";
      }

      // Consulta en la tabla que relaciona personas con documentos
      const query = `
            SELECT id_persona 
            FROM persona_tipo_documento 
            WHERE id_tipo_documento = $1 AND numero = $2 
            LIMIT 1
            `;
      const result = await pool.query(query, [tipo, numero]);

      if (result.rows.length > 0) return true;
      else return false;
    } catch (error) {
      console.error("Error al validar documento:", error);
      return "Error interno del servidor";
    }
  }

  //ACTUALIZA DATOS DE UNA PERSONA ALLEGADA
  async updatePersonaAllegada(objeto, id) {
    try {
      await pool.query("BEGIN");
      const fechaActual = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const objetoBuscado = await pool.query(
        `update persona_allegado set id_persona = $2, id_alumno = $3, id_tipo_allegado = $4, id_estudio_alcanzado = $5, id_ocupacion = $6, tutor = $7, activo = $8, fecha_alta = $9, usuario_alta = $10, fecha_ultima_modificacion = $11, usuario_ultima_modificacion = $12 where id_persona_allegado=$1`,
        [
          id,
          objeto.id_persona,
          objeto.id_alumno,
          objeto.id_tipo_allegado,
          objeto.id_estudio_alcanzado,
          objeto.id_ocupacion,
          objeto.tutor,
          objeto.activo,
          fechaActual,
          objeto.usuario_sistema,
          fechaActual,
          objeto.usuario_sistema,
        ],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async getGrado(id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `select id_grado, nombre from grado where id_establecimiento = $1 order by id_grado`,
        [id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getDivision(id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `select id_division, division from divisiones where id_establecimiento = $1 order by id_division`,
        [id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getAnioCursado() {
    try {
      const objetoBuscado = await pool.query(
        `select id_anio, anio from anio order by anio desc`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getListado(id, id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `select dc.*, g.*, a.*, d.* from alumno_datos_cursada dc, grado g, anio a, divisiones d, alumno alu
                where dc.id_grado = g.id_grado and dc.anio_cursada = a.id_anio and dc.id_division = d.id_division and
                alu.id_alumno = dc.id_alumno and alu.id_establecimiento = $2 and
                dc.id_alumno = $1
                order by a.anio DESC`,
        [id, id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  // ALTA MÚLTIPLE
  async createAcademica(objeto) {
    const query = `
    INSERT INTO alumno_datos_cursada (
        id_alumno, id_grado, division, genero_costo_inscripcion, 
        pago_inscripcion, anio_cursada, id_division
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `;

    // Array para guardar los resultados de cada inserción
    const resultadosInsertados = [];

    try {
      await pool.query("BEGIN");

      // 🌟 RECORREMOS todo el historial académico que viene del frontend
      for (const item of objeto.historialAcademico) {
        const valores = [
          item.id_alumno,
          parseInt(item.id_grado),
          item.division,
          item.genero_cargo,
          item.pago_cargo,
          item.anio_cursada,
          parseInt(item.id_division),
        ];

        console.log("Intentando insertar registro con los valores:", valores);

        const resultado = await pool.query(query, valores);
        resultadosInsertados.push(resultado.rows[0]);
      }

      await pool.query("COMMIT");
      console.log(
        "Todos los registros se guardaron correctamente. Cantidad:",
        resultadosInsertados.length,
      );

      // Devolvemos el array con todos los registros creados o el primero si tu frontend espera solo un objeto
      return resultadosInsertados;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(
        "❌ Error al insertar múltiples registros en Postgres:",
        error,
      );
      throw error;
    }
  }

  async deleteAcademica(id) {
    try {
      await pool.query("BEGIN");
      const objetoBuscado = await pool.query(
        `delete from alumno_datos_cursada where id_alumno_dato_cursada=$1`,
        [id],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

  async updateAcademica(objeto) {
    try {
      const resultados = [];

      // 1. Validamos que exista el historial y sea un array recorrible
      if (
        !objeto ||
        !objeto.historialAcademico ||
        !Array.isArray(objeto.historialAcademico)
      ) {
        return null;
      }

      // 2. Definimos el bucle para iterar sobre cada registro utilizando 'item'
      for (const item of objeto.historialAcademico) {
        // ¡Acá agregamos el UPDATE que faltaba al principio!
        const queryText = `
        UPDATE alumno_datos_cursada 
        SET id_alumno = $2, 
            id_grado = $3, 
            division = $4, 
            genero_costo_inscripcion = $5, 
            pago_inscripcion = $6, 
            anio_cursada = $7, 
            id_division = $8 
        WHERE id_alumno_dato_cursada = $1
        RETURNING *;
      `;

        const queryValues = [
          parseInt(item.id_alumno_dato_cursada), // $1
          parseInt(item.id_alumno), // $2
          parseInt(item.id_grado), // $3
          item.division, // $4
          item.genero_costo_inscripcion, // $5
          item.pago_inscripcion, // $6
          parseInt(item.anio_cursada), // $7
          parseInt(item.id_division), // $8
        ];

        // 3. Ejecutamos la consulta en tu pool de base de datos
        const resQuery = await pool.query(queryText, queryValues);
        // Nota: Si usás "this.pool" o "pool" directo, adaptalo según cómo esté instanciado en tu clase ContainerPg

        if (resQuery.rows.length > 0) {
          resultados.push(resQuery.rows[0]);
        }
      }

      return resultados;
    } catch (error) {
      console.error("Error en ContainerPg.updateAcademica:", error);
      throw error;
    }
  }

  async getMedios() {
    try {
      const objetoBuscado = await pool.query(
        `select id_medio_pago, nombre from medio_pago order by jerarquia`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getMarcas() {
    try {
      const objetoBuscado = await pool.query(
        `select id_marca_tarjeta, nombre from marca_tarjeta order by jerarquia`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getEntidades() {
    try {
      const objetoBuscado = await pool.query(
        `select id_entidad_bancaria, nombre from entidad_bancaria order by id_entidad_bancaria`,
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getListadoPagos(id, id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `SELECT 
    at.id_alumno_tarjeta, 
    at.id_alumno, 
    at.id_medio_pago, 
    COALESCE(mp.nombre, '-') AS medio_pago, 
    at.id_marca_tarjeta, 
    COALESCE(mt.nombre, '-') AS marca_tarjeta, 
    at.id_entidad_bancaria, 
    COALESCE(eb.nombre, '-') AS entidad_bancaria, 
    COALESCE(at.numero_tarjeta, '-') AS numero_tarjeta, 
    COALESCE(at.nombre_titular, '-') AS nombre_titular, 
    COALESCE(at.activo, '-') AS activo
FROM alumno_tarjeta at
JOIN alumno a ON at.id_alumno = a.id_alumno
JOIN persona p ON a.id_persona = p.id_persona
JOIN medio_pago mp ON at.id_medio_pago = mp.id_medio_pago
LEFT JOIN marca_tarjeta mt ON at.id_marca_tarjeta = mt.id_marca_tarjeta
LEFT JOIN entidad_bancaria eb ON at.id_entidad_bancaria = eb.id_entidad_bancaria
WHERE a.id_alumno = $1
  AND a.id_establecimiento = $2;`,
        [id, id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  // ALTA MÚLTIPLE
  async createPago(objeto) {
    const query = `
    INSERT INTO alumno_tarjeta (
        id_alumno, id_medio_pago, id_marca_tarjeta, id_entidad_bancaria, 
        numero_tarjeta, activo, nombre_titular
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `;

    try {
      await pool.query("BEGIN");

      if (
        Number(objeto.id_medio_pago) === 1 ||
        Number(objeto.id_medio_pago) === 2 ||
        Number(objeto.id_medio_pago) === 5 ||
        Number(objeto.id_medio_pago) === 6
      ) {
        objeto.id_marca_tarjeta = null;
        objeto.id_entidad_bancaria = null;
        objeto.numero_tarjeta = null;
        objeto.activo = null;
        objeto.nombre_titular = null;
      }

      const valores = [
        objeto.id_alumno,
        objeto.id_medio_pago,
        objeto.id_marca_tarjeta,
        objeto.id_entidad_bancaria,
        objeto.numero_tarjeta,
        objeto.activo,
        objeto.nombre_titular,
      ];

      console.log("Intentando insertar registro con los valores:", valores);

      const resultado = await pool.query(query, valores);

      await pool.query("COMMIT");

      return resultado;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error(
        "❌ Error al insertar múltiples registros en Postgres:",
        error,
      );
      throw error;
    }
  }

  async deletePago(id) {
    try {
      await pool.query("BEGIN");
      const objetoBuscado = await pool.query(
        `delete from alumno_tarjeta where id_alumno_tarjeta=$1`,
        [id],
      );
      await pool.query("COMMIT");
      return objetoBuscado;
    } catch (error) {
      await pool.query("ROLLBACK");
      return error;
    }
  }

async generarArchivoDebito() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const resultado = await client.query(
      `SELECT * FROM spcreacionarchivodebitobuffers()`
    );

    await client.query("COMMIT");

    const archivos = resultado.rows[0];

    return {
      archivo_visa_debito:
        archivos.archivo_visa_debito?.toString("utf8"),

      archivo_visa_credito:
        archivos.archivo_visa_credito?.toString("utf8"),

      archivo_mastercard_credito:
        archivos.archivo_mastercard_credito?.toString("utf8"),
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}



  async updatePago(objeto) {
    try {
      if (
        Number(objeto.id_medio_pago) === 1 ||
        Number(objeto.id_medio_pago) === 2 ||
        Number(objeto.id_medio_pago) === 5 ||
        Number(objeto.id_medio_pago) === 6
      ) {
        objeto.id_marca_tarjeta = null;
        objeto.id_entidad_bancaria = null;
        objeto.numero_tarjeta = null;
        objeto.activo = null;
        objeto.nombre_titular = null;
      }

      const queryText = `
        UPDATE alumno_tarjeta 
        SET id_alumno = $2, 
            id_medio_pago = $3, 
            id_marca_tarjeta = $4, 
            id_entidad_bancaria = $5, 
            numero_tarjeta = $6, 
            activo = $7, 
            nombre_titular = $8 
        WHERE id_alumno_tarjeta = $1
        RETURNING *;
      `;

      const queryValues = [
        objeto.id_alumno_tarjeta, // $1
        objeto.id_alumno, // $2
        objeto.id_medio_pago, // $3
        objeto.id_marca_tarjeta, // $4
        objeto.id_entidad_bancaria, // $5
        objeto.numero_tarjeta, // $6
        objeto.activo, // $7
        objeto.nombre_titular, // $8
      ];

      // 3. Ejecutamos la consulta en tu pool de base de datos
      const resultados = await pool.query(queryText, queryValues); 
      
    return resultados;

  } catch (error) {
    console.error("Error en ContainerPg.updateAcademica:", error);
    throw error;
  }
}


  async getEscuela(id) {
    try {
      const objetoBuscado = await pool.query(
        `select * from entidades_educativas where identidadeducativa=$1`,[id],
      );
      return objetoBuscado.rows[0];
    } catch (error) {
      return error;
    }
  }


    async parametros(id) {
    try {
      const objetoBuscado = await pool.query(
        `select * from parametros_sistema where id_establecimiento=$1`,[id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

async createPagoCuota(objeto) {
    const query = `
INSERT INTO transaccion_cuenta_corriente (
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
    cae
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
    $21, $22, $23
) 
RETURNING id_transaccion_cc;
    `;

    try {
      await pool.query("BEGIN");

      // $9: Comprobante Manual del Formulario
      const nroComprobanteManual = objeto.nroComprobante || objeto.numero_comprobante;

      // $20: Factura Electrónica de AFIP
      const nroFacturaAfip = objeto.comprobante_numero;

      const valoresBrutos = [
        objeto.id_alumno_cc,
        objeto.fecha_transaccion,
        objeto.id_estado_cuota,
        objeto.importe,
        objeto.fechaPago,
        null,
        objeto.usuario,
        objeto.fecha_ultima_modificacion,
        nroComprobanteManual, // $9: numero_comprobante (Manual)
        objeto.nroLote,
        objeto.nroAutorizacion,
        objeto.id_medio_pago,
        objeto.id_marca_tarjeta,
        objeto.id_motivo_rechazo1,
        objeto.id_motivo_rechazo2,
        objeto.codigo_error_debito,
        objeto.descripcion_error_debito,
        objeto.punto_venta || objeto.puntoVenta,
        objeto.comprobante_tipo || objeto.tipoComprobante,   
        nroFacturaAfip,       // $20: comprobante_numero (AFIP)
        false,
        objeto.fecha_ultima_modificacion,
        objeto.cae
      ];

      const valores = valoresBrutos.map((val) => (val === "" || val === undefined ? null : val));

      console.log("Intentando insertar registro con los valores:", valores);

      const resultado = await pool.query(query, valores);

      await pool.query("COMMIT");

      return resultado;
    } catch (error) {
      await pool.query("ROLLBACK");
      console.error("❌ Error al insertar múltiples registros en Postgres:", error);
      throw error;
    }
  }

}

export { ContainerPg };
