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
                motivo_desercion.nombre AS motivo_desercion, -- <-- Se agrega el campo nombre asignándole un alias claro
	            alumno_datos_cursada.id_grado as id_grado,
	            grado.nombre as grado,
	            grado.id_nivel as id_nivel,
	            nivel.nombre as nivel	       
            FROM persona 
            INNER JOIN persona_tipo_documento ON persona.id_persona = persona_tipo_documento.id_persona 
            INNER JOIN tipo_documento td ON td.id_tipo_documento = persona_tipo_documento.id_tipo_documento
            LEFT JOIN alumno ON alumno.id_persona = persona.id_persona
            LEFT JOIN motivo_desercion ON motivo_desercion.id_motivo_desercion = alumno.id_motivo_desercion -- <-- LEFT JOIN agregado
            LEFT JOIN alumno_datos_cursada ON alumno_datos_cursada.id_alumno = alumno.id_alumno
	        LEFT JOIN grado ON grado.id_grado = alumno_datos_cursada.id_grado
	        LEFT JOIN nivel ON nivel.id_nivel = grado.id_nivel
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
  const { 
    search, 
    esAlumno, 
    esTutor, 
    estado, 
    incluirSaldo,
    idNivel,
    idGrado,
    idDivision 
  } = filtros;

  const conditions = ["persona.activo <> 'B' AND persona.es_alumno IS NOT NULL"];
  const params = [];

  if (search && search.trim() !== "") {
    params.push(`%${search.trim()}%`);
    const paramIndex = `$${params.length}`;

    conditions.push(`(
      persona.apellidos ILIKE ${paramIndex} OR 
      persona.nombres ILIKE ${paramIndex} OR 
      persona_tipo_documento.numero ILIKE ${paramIndex}
    )`);
  }

  if (String(esAlumno) === "true") {
    conditions.push(`alumno.id_alumno IS NOT NULL`);
  }

  if (String(esTutor) === "true") {
    conditions.push(`es_alumno = 'N'`);
  }

  if (String(esAlumno) === "true" && estado === "activo") {
    conditions.push(`alumno.regular = 'S'`);
  } else if (String(esAlumno) === "true" && estado === "pasivo") {
    conditions.push(`alumno.regular = 'N'`);
  }

  if (idNivel && idNivel !== "") {
    params.push(idNivel);
    conditions.push(`nivel.id_nivel = $${params.length}`);
  }

  if (idGrado && idGrado !== "") {
    params.push(idGrado);
    conditions.push(`alumno_datos_cursada.id_grado = $${params.length}`);
  }

  if (idDivision && idDivision !== "") {
    params.push(idDivision);
    conditions.push(`(alumno_datos_cursada.id_division = $${params.length} OR divisiones.id_division = $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const debeCalcularSaldo = String(incluirSaldo) === "true";

  const selectDeudaFields = debeCalcularSaldo 
    ? `, COALESCE(deuda.cantidad_cuotas_adeudadas, 0) AS cantidad_cuotas_adeudadas, COALESCE(deuda.saldo_total, 0) AS saldo_total`
    : '';

  const joinDeudaQuery = debeCalcularSaldo 
    ? `
        LEFT JOIN (
            SELECT 
                acc.id_alumno,
                COUNT(DISTINCT acc.id_alumno_cc) AS cantidad_cuotas_adeudadas,
                SUM(tcc.importe) AS saldo_total
            FROM transaccion_cuenta_corriente tcc
            INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tcc.id_alumno_cc
            GROUP BY acc.id_alumno
            HAVING SUM(tcc.importe) > 0
        ) deuda ON deuda.id_alumno = alumno.id_alumno
      `
    : '';

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
            motivo_desercion.nombre AS motivo_desercion,
            alumno_datos_cursada.id_grado AS id_grado,
            grado.nombre AS nombre_grado,
            nivel.id_nivel AS id_nivel,
            nivel.nombre AS nombre_nivel,
            COALESCE(alumno_datos_cursada.id_division, divisiones.id_division) AS id_division,
            COALESCE(divisiones.division, alumno_datos_cursada.division) AS division
            ${selectDeudaFields}
        FROM persona 
        INNER JOIN persona_tipo_documento ON persona.id_persona = persona_tipo_documento.id_persona 
        INNER JOIN tipo_documento td ON td.id_tipo_documento = persona_tipo_documento.id_tipo_documento
        LEFT JOIN alumno ON alumno.id_persona = persona.id_persona
        LEFT JOIN motivo_desercion ON motivo_desercion.id_motivo_desercion = alumno.id_motivo_desercion
        
        LEFT JOIN LATERAL (
            SELECT adc.*
            FROM alumno_datos_cursada adc
            WHERE adc.id_alumno = alumno.id_alumno
            ORDER BY adc.anio_cursada DESC 
            LIMIT 1
        ) alumno_datos_cursada ON true

        ${joinDeudaQuery}

        LEFT JOIN grado ON grado.id_grado = alumno_datos_cursada.id_grado
        LEFT JOIN nivel ON nivel.id_nivel = grado.id_nivel
        LEFT JOIN divisiones ON (
            divisiones.id_division = alumno_datos_cursada.id_division 
            OR LOWER(TRIM(divisiones.division)) = LOWER(TRIM(alumno_datos_cursada.division))
        )
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
    // Resultado: "2026-05-25 14:20:00"registrarDocumentoPersona

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
      const parametro = 'fecha_desde_listado_cuenta_corriente';
      const fecha = await pool.query(`SELECT valor FROM parametros_sistema WHERE parametro = $1`, [parametro]);
      
      if (!fecha.rows || fecha.rows.length === 0) {
        throw new Error('No se encontró el parámetro fecha_desde_listado_cuenta_corriente.');
      }
    
      const getStartOfYear = (f) => `${f}-01-01 00:00:00`;
      const fecha_inicio = getStartOfYear(fecha.rows[0].valor);

      
      const parametro2 = 'criterio_generacion_cuota';
      const orden = await pool.query(`SELECT valor FROM parametros_sistema WHERE parametro = $1`, [parametro2]);
  
      if (!orden.rows | orden.rows.length === 0) {
        throw new Error('No se encontró el parámetro criterio_generacion_cuota.');
      }

      const tipoOrden = orden.rows[0].valor;


        // 1. Diccionario de ordenamientos seguros (Evita SQL Injection)
  const opcionesOrden = {
    // Opción A: Cuotas por mes nominal, Materiales/Inscripción por fecha real
    ultima_generada: `
      acc.id_alumno_cc ASC, 
      tcc.fecha_transaccion ASC,
      tcc.id_transaccion_cc ASC
    `,
    // Opción B: Por número de cuota estricto (01, 02, 03...)
    cuota: `Anio ASC, Cuota ASC, tcc.fecha_transaccion ASC`,

    // Opción C: Alfabético por descripción del concepto
    alfabetico: `acc.descripcion ASC, tcc.fecha_transaccion ASC`,

    // Opción D: Por fecha real de transacción pura
    fecha_transaccion: `tcc.fecha_transaccion ASC, tcc.id_transaccion_cc ASC`
  };

  // 2. Selección de la cláusula (si envían un valor no válido, usa 'cronologico' por defecto)
  const ordenSQL = opcionesOrden[tipoOrden] || opcionesOrden.ultima_generada;

    
      try {
        const objetoBuscado = await pool.query(
          `SELECT  
            tcc.id_transaccion_cc, 
            acc.id_alumno_cc, 
            MAX(tcc.id_estado_cuota) AS id_estado_cuota, 
            MAX(ec.nombre) AS estado_cuota,
            MAX(tcc.fecha_pago) AS fecha_pago, 
            MAX(tcc.fecha_respuesta_prisma) AS fecha_respuesta_prisma, 
            tcc.fecha_transaccion, 
            MAX(tcc.id_medio_pago) AS id_medio_pago, 
            MAX(mp.nombre) AS medio_pago,
            MAX(tcc.id_marca_tarjeta) AS id_marca_tarjeta, 
            MAX(tcc.id_motivo_rechazo1) AS id_motivo_rechazo1, 
            MAX(tcc.id_motivo_rechazo2) AS id_motivo_rechazo2, 
            MAX(tcc.codigo_error_debito) AS codigo_error_debito, 
            MAX(tcc.descripcion_error_debito) AS descripcion_error_debito, 
            MAX(tcc.descripcion_error_debito) AS motivo_rechazo,
            MAX(tcc.importe) AS importe,
            MAX(tcc.CAE) AS cae,
            g.nombre AS Grado,  
            CONCAT(p.apellidos, ' ', p.nombres) AS NombreAlumno, 
            a.legajo,
            MAX(a.direccion_calle) || ' ' || MAX(a.direccion_numero) AS direccion_alumno,
            MAX(tcc.numero_comprobante) AS numero_comprobante, 
            MAX(tcc.numero_lote) AS numero_lote, 
            MAX(tcc.numero_autorizacion) AS numero_autorizacion, 
            MAX(tcc.punto_venta) AS punto_venta, 
            MAX(tcc.comprobante_tipo) AS comprobante_tipo, 
            MAX(tcc.comprobante_numero) AS comprobante_numero,
            MAX(mt.nombre) AS nombre_tarjeta,
            MAX(ee.entidadeducativa) AS entidad_educativa,
            MAX(ee.direccion) AS direccion,
            MAX(ee.numero) AS numero,
            MAX(ee.logo) AS logo,
            MAX(ee.cuit) AS cuit_institucion,
            MAX(RP.persona_allegada) AS persona_allegada,
            MAX(loc.nombre) AS localidad_nombre,
            MAX(prov.nombre) AS provincia_nombre,
            MAX(RP.cuit_tutor) AS cuil_tutor,         
            MAX(RP.id_tipo_documento_tutor) AS id_tipo_documento_tutor,
            MAX(param.ingresos_brutos) AS ingresos_brutos,
            MAX(param.condicion_iva) AS condicion_iva,
            MAX(param.inicio_actividades) AS inicio_actividades,
    
            -- Año asignado para la cuota/cargo
            CASE 
                WHEN UPPER(acc.descripcion) LIKE '%INSCRIP%' OR UPPER(acc.descripcion) LIKE '%MATERIAL%' 
                    THEN TO_CHAR(acc.fecha_generacion_cc, 'YYYY')
                WHEN acc.cuota IS NULL OR TRIM(acc.cuota) = '' 
                    THEN SUBSTRING(acc.descripcion FROM 20 FOR 4)
                ELSE RIGHT(acc.cuota, 4)
            END AS Anio,
    
            -- Identificador visual de la cuota
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
            r2.SaldoTotal  
    
          FROM transaccion_cuenta_corriente tcc
          INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tcc.id_alumno_cc
          INNER JOIN alumno a ON a.id_alumno = acc.id_alumno
          LEFT JOIN marca_tarjeta mt ON tcc.id_marca_tarjeta = mt.id_marca_tarjeta
          LEFT JOIN public.medio_pago mp ON tcc.id_medio_pago = mp.id_medio_pago
          INNER JOIN public.estado_cuota ec ON tcc.id_estado_cuota = ec.id_estado_cuota
          LEFT JOIN entidades_educativas ee ON ee.identidadeducativa = a.id_establecimiento
          LEFT JOIN localidad loc ON ee.localidad = loc.id_localidad
          LEFT JOIN provincia prov ON ee.provincia = prov.id_provincia
    
          -- Parámetros del sistema
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
    
          -- Tutor o allegado principal
          INNER JOIN (
              SELECT 
                  pa.id_alumno,
                  per.apellidos || ', ' || per.nombres AS persona_allegada,
                  tipdoc.numero AS cuit_tutor,
                  tipdoc.id_tipo_documento AS id_tipo_documento_tutor,
                  ROW_NUMBER() OVER (
                      PARTITION BY pa.id_alumno 
                      ORDER BY 
                          CASE 
                              WHEN tipdoc.id_tipo_documento = 7 THEN 1 
                              WHEN tipdoc.id_tipo_documento = 8 THEN 2 
                              ELSE 3 
                          END
                  ) AS orden
              FROM persona_allegado pa
              INNER JOIN persona per ON per.id_persona = pa.id_persona
              LEFT JOIN persona_tipo_documento tipdoc ON tipdoc.id_persona = pa.id_persona
          ) RP ON RP.id_alumno = a.id_alumno AND RP.orden = 1
    
          -- Saldo total acumulado
          INNER JOIN (
              SELECT id_alumno, SUM(tc.importe) AS SaldoTotal 
              FROM transaccion_cuenta_corriente tc
              INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tc.id_alumno_cc    
              GROUP BY id_alumno
          ) AS r2 ON r2.id_alumno = a.id_alumno
    
          -- Último grado cursado
          INNER JOIN (
              SELECT id_alumno, MAX(id_grado) AS ultGrado
              FROM alumno_datos_cursada
              GROUP BY id_alumno
          ) AS adc ON adc.id_alumno = a.id_alumno
          INNER JOIN grado g ON g.id_grado = adc.ultGrado
    
          WHERE a.id_alumno = $1 
            AND tcc.fecha_transaccion >= $2::timestamp 
              
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
              r2.SaldoTotal  
    
ORDER BY ${ordenSQL};
    `,
    
          [id, fecha_inicio]
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
        `select id_grado, nombre, id_nivel from grado where id_establecimiento = $1 order by id_grado`,
        [id_establecimiento],
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

  async getNivel(id_establecimiento) {
    try {
      const objetoBuscado = await pool.query(
        `select id_nivel, nombre, id_establecimiento from nivel where id_establecimiento = $1 order by id_nivel`,
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

    async getCargos() {
    try {
      const objetoBuscado = await pool.query(
        `select id_cargo_cuenta_corriente, nombre from cargo_cuenta_corriente order by nombre`,
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
    cae,
    notificado_rechazo,
    fecha_notificacion_rechazo,
    notificado_whatsapp,
    fecha_notificacion_whatsapp,
    notificado_mail,
    fecha_notificacion_mail
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
    $21, $22, $23, $24, $25, $26, $27, $28, $29
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
        objeto.fecha_respuesta_prisma,
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
        null,
        objeto.cae,
        false,
        null,
        false,
        null,
        false,
        null
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


  
  // ALTA MÚLTIPLE
async GenerarPagos(objeto) {
  const client = await pool.connect();

  const checkExistenciaQuery = `
  SELECT 1 
  FROM alumno_cuenta_corriente 
  WHERE id_alumno = $1 
    AND id_cargo_cuenta_corriente = $2 
    AND (
      ($2 = 3 AND descripcion = $4) -- Materiales: valida por descripción
      OR 
      ($2 <> 3 AND cuota = $3)      -- Inscripción / Cuotas: valida por cuota
    )
  LIMIT 1;
`;

 // Consulta para verificar si el alumno registra deuda impaga (saldo acumulado > 0)
const checkDeudaQuery = `
  SELECT 1 
  FROM transaccion_cuenta_corriente tcc
  INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tcc.id_alumno_cc
  WHERE acc.id_alumno = $1
  GROUP BY acc.id_alumno
  HAVING SUM(tcc.importe) > 0
  LIMIT 1;
`;

// Consulta para verificar el parámetro de validación de deuda en inscripción
const obtenerParametroDeudaQuery = `
  SELECT valor 
  FROM parametros_sistema 
  WHERE parametro = 'valida_cuotas_impagas_pago_inscripcion'
  LIMIT 1;
`;

  const obtenerAlumnoQuery = `
    SELECT 
      p.apellidos, 
      p.nombres, 
      COALESCE(td.nombre_corto, 'DNI') AS tipo_documento, 
      ptd.numero AS numero_documento
    FROM alumno a
    INNER JOIN persona p ON p.id_persona = a.id_persona
    LEFT JOIN persona_tipo_documento ptd ON ptd.id_persona = p.id_persona
    LEFT JOIN tipo_documento td ON td.id_tipo_documento = ptd.id_tipo_documento
    WHERE a.id_alumno = $1
    LIMIT 1;
  `;

  const query1 = `
    INSERT INTO alumno_cuenta_corriente (
        id_alumno, usuario_alta, fecha_generacion_cc, cuota, 
        descripcion, id_cargo_cuenta_corriente, importe, numero_cuota
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id_alumno_cc;
  `;

  const query2 = `
    INSERT INTO transaccion_cuenta_corriente (
        id_alumno_cc, fecha_transaccion, id_estado_cuota, importe, fecha_pago,
        fecha_respuesta_prisma, usuario_ultima_modificacion, fecha_ultima_modificacion,
        numero_comprobante, numero_lote, numero_autorizacion, id_medio_pago,
        id_marca_tarjeta, id_motivo_rechazo1, id_motivo_rechazo2, codigo_error_debito,
        descripcion_error_debito, punto_venta, comprobante_tipo, comprobante_numero,
        importe_actualizado, fecha_actualizacion_importe, cae,
        notificado_rechazo, fecha_notificacion_rechazo, notificado_whatsapp, 
        fecha_notificacion_whatsapp, notificado_mail, fecha_notificacion_mail
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29
    )
    RETURNING *;
  `;

  const listaItems = Array.isArray(objeto) ? objeto : (objeto.items || []);
  const usuarioSistema = objeto.usuario_sistema;

  let generados = 0;
  let noGenerados = 0;
  const detallesGenerados = [];   // <-- 1. Inicializamos el array
  const detallesNoGenerados = [];

  try {
    await client.query("BEGIN");

    const resParam = await client.query(obtenerParametroDeudaQuery);
    const validaParametroDeuda = resParam.rows.length > 0 && 
  ['S', 'SI', 'TRUE', '1'].includes(String(resParam.rows[0].valor).toUpperCase());

    for (const item of listaItems) {

      // Validar que el cargo de Materiales (id_cargo = 3) solo se aplique a Nivel Inicial (id_nivel = 1)
      if (Number(item.id_cargo_cuenta_corriente) === 3 && Number(item.id_nivel) !== 1) {
        //console.log(`[RECHAZADO - PASO 1] Alumno ${item.id_alumno} no es Nivel Inicial (Nivel actual: ${item.id_nivel})`);
          noGenerados++;
          const datosAlumno = await client.query(obtenerAlumnoQuery, [item.id_alumno]);
          if (datosAlumno.rows.length > 0) {
              detallesNoGenerados.push({
                  ...datosAlumno.rows[0],
                  motivo: 'El cargo de Materiales solo aplica a Nivel Inicial'
              });
          }
          continue;
      }


      // 1. Validar si ya existe la cuota/cargo para el alumno
    const existeCargo = await client.query(checkExistenciaQuery, [
        item.id_alumno,
        Number(item.id_cargo_cuenta_corriente),
        item.cuota || null,
        item.descripcion || null
    ]);

    if (existeCargo.rows.length > 0) {
        noGenerados++;

        // Obtener datos personales del alumno omitido
        const datosAlumno = await client.query(obtenerAlumnoQuery, [item.id_alumno]);
        if (datosAlumno.rows.length > 0) {
            detallesNoGenerados.push({
                ...datosAlumno.rows[0],
                motivo: 'Ya tiene el cargo o cuota generada'
            });
        }
        continue;
    }

    
      if (validaParametroDeuda && Number(item.id_cargo_cuenta_corriente) === 1) {
        const tieneDeuda = await client.query(checkDeudaQuery, [item.id_alumno]);
        if (tieneDeuda.rows.length > 0) {
            noGenerados++;
            const datosAlumno = await client.query(obtenerAlumnoQuery, [item.id_alumno]);
            if (datosAlumno.rows.length > 0) {
                detallesNoGenerados.push({
                    ...datosAlumno.rows[0],
                    motivo: 'Posee cuotas impagas'
                });
            }
            continue;
        }
    }



        // 2. Insertar en alumno_cuenta_corriente
        const valores1 = [
          item.id_alumno,
          usuarioSistema,
          item.fecha,
          item.cuota,
          item.descripcion,
          item.id_cargo_cuenta_corriente,
          null,
          null
        ];
        const res1 = await client.query(query1, valores1);
        const idAlumnoCc = res1.rows[0].id_alumno_cc;

        // 3. Insertar en transaccion_cuenta_corriente
        const valores2 = [
          idAlumnoCc, item.fecha, 1, item.importe, null, null,
          usuarioSistema, item.fecha, null, null, null, null, null,
          null, null, null, null, null, null, null, false, null, null,
          false, null, false, null, false, null
        ];
        await client.query(query2, valores2);


        // <-- 2. Guardamos la información del alumno generado exitosamente
      const datosAlumnoGenerado = await client.query(obtenerAlumnoQuery, [item.id_alumno]);
      if (datosAlumnoGenerado.rows.length > 0) {
        detallesGenerados.push(datosAlumnoGenerado.rows[0]);
      }

        generados++;
      }
    

    await client.query("COMMIT");

    return {
      exito: true,
      resumen: {
        generados,
        noGenerados
      },
      detallesGenerados, // <-- 3. Lo incluimos en el objeto de respuesta
      detallesNoGenerados
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release(); // Liberar el cliente al pool
  }
}


async AlumnosPendientes({ cuota, anio, incluirNoRegulares }) {

    const parametro = 'importe_mensual_cuota';
    const resultParam = await pool.query(`select valor from parametros_sistema where parametro = $1`, [parametro]);
    const importeActualVal = Number(resultParam.rows[0]?.valor).toFixed(2);

    let sql = `
        WITH doc_priorizado AS (
            SELECT 
                persdoc.id_persona,
                persdoc.numero,
                tipdoc.nombre_corto AS tipo_documento,
                ROW_NUMBER() OVER (
                    PARTITION BY persdoc.id_persona 
                    ORDER BY 
                        CASE 
                            WHEN UPPER(tipdoc.nombre) = 'DNI' THEN 1
                            WHEN UPPER(tipdoc.nombre) = 'CUIL' THEN 2
                            ELSE 3 
                        END
                ) AS orden_prioridad
            FROM persona_tipo_documento persdoc
            INNER JOIN tipo_documento tipdoc ON persdoc.id_tipo_documento = tipdoc.id_tipo_documento
        )
        SELECT 
            acc.id_alumno_cc,
            alu.id_alumno,
            pers.apellidos AS apellido, 
            pers.nombres AS nombre,
            doc.tipo_documento AS tipo_documento,
            doc.numero AS documento,
            acc.descripcion AS cuota,
            acc.cuota AS cuotaid,
            tcc_pos.importe AS "importeActual"
        FROM alumno_cuenta_corriente acc
        INNER JOIN alumno alu ON acc.id_alumno = alu.id_alumno
        INNER JOIN persona pers ON alu.id_persona = pers.id_persona
        LEFT JOIN doc_priorizado doc ON pers.id_persona = doc.id_persona AND doc.orden_prioridad = 1
        INNER JOIN transaccion_cuenta_corriente tcc_pos 
            ON acc.id_alumno_cc = tcc_pos.id_alumno_cc 
           AND tcc_pos.importe > 0
        WHERE acc.id_cargo_cuenta_corriente = 2 
          AND NOT EXISTS (
            SELECT 1 
            FROM transaccion_cuenta_corriente tcc 
            WHERE tcc.id_alumno_cc = acc.id_alumno_cc 
              AND (tcc.importe < 0 OR tcc.importe = ${importeActualVal})
          )
          AND UPPER(TRIM(pers.activo)) = 'S'
    `;

    const values = [];

    // Filtro por alumnos regulares ('S')
    if (incluirNoRegulares !== 'true' && incluirNoRegulares !== true) {
        sql += ` AND UPPER(TRIM(alu.regular)) = 'S'`;
    }

    const strCuota = cuota ? String(cuota).trim() : '';
    const strAnio = anio ? String(anio).trim() : '';

    if (strCuota !== '' && strAnio !== '') {
        const cuotaConCero = strCuota.padStart(2, '0');
        const cuotaNum = Number(strCuota);
        const codigoCuota = `${cuotaConCero}${strAnio}`;

        values.push(codigoCuota);
        const p1 = values.length;

        values.push(`%${cuotaNum}%${strAnio}%`);
        const p2 = values.length;

        sql += ` AND (TRIM(acc.cuota) = $${p1} OR acc.descripcion ILIKE $${p2})`;

    } else if (strCuota !== '') {
        const cuotaConCero = strCuota.padStart(2, '0');
        const cuotaNum = Number(strCuota);

        values.push(`${cuotaConCero}%`);
        const p1 = values.length;

        values.push(`%${cuotaNum}%`);
        const p2 = values.length;

        sql += ` AND (TRIM(acc.cuota) LIKE $${p1} OR acc.descripcion ILIKE $${p2})`;

    } else if (strAnio !== '') {
        values.push(`%${strAnio}%`);
        const p1 = values.length;

        sql += ` AND (TRIM(acc.cuota) LIKE $${p1} OR acc.descripcion ILIKE $${p1})`;
    }

    // Agregar el ordenamiento por apellido, nombre y cuota
    sql += ` ORDER BY pers.apellidos ASC, pers.nombres ASC, acc.cuota ASC`;

    // Ejecución utilizando la conexión propia del ContainerPg (this.pool o pool)
    const queryExec = this.pool ? this.pool : pool;
    const result = await queryExec.query(sql, values);
    
    return result.rows;
}



async ActualizarImporte(objeto) {
 // console.log("Procesando actualización:", objeto);

  // 1. Usar siempre 'client' para mantener la transacción
  const client = await pool.connect();

  const detallesGenerados = []; 
  const detallesNoGenerados = []; 

  try {
    await client.query("BEGIN");

    function getFormattedDate() {
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}000`;
      }

    for (const item of objeto.alumnos) {
      try {
        // 2. Ejecutar el UPDATE una sola vez usando 'client'
        await client.query(
          `UPDATE transaccion_cuenta_corriente 
           SET importe = $1, importe_actualizado = $4, fecha_actualizacion_importe = $5   
           WHERE id_alumno_cc = $2 AND importe = $3`,
          [
            objeto.valorCuotaAplicar,
            item.id_alumno_cc,
            item.importeActualVal,
            true,
            getFormattedDate()
          ]
        );

        // 3. Consulta de datos del alumno con la prioridad de documento
        const resAlumno = await client.query(`
          WITH doc_priorizado AS (
              SELECT 
                  ptd.id_persona,
                  ptd.numero AS numero_documento,
                  td.nombre AS tipo_documento_largo,
                  td.nombre_corto AS tipo_documento,
                  ROW_NUMBER() OVER (
                      PARTITION BY ptd.id_persona 
                      ORDER BY 
                          CASE 
                              WHEN UPPER(TRIM(td.nombre)) = 'DNI' OR UPPER(TRIM(td.nombre_corto)) = 'DNI' THEN 1
                              WHEN UPPER(TRIM(td.nombre)) = 'CUIL' OR UPPER(TRIM(td.nombre_corto)) = 'CUIL' THEN 2
                              ELSE 3
                          END
                  ) AS rn
              FROM persona_tipo_documento ptd
              INNER JOIN tipo_documento td ON ptd.id_tipo_documento = td.id_tipo_documento
          )
          SELECT 
              a.*, 
              p.*, 
              dp.tipo_documento, 
              dp.tipo_documento_largo,
              dp.numero_documento
          FROM alumno a
          INNER JOIN persona p ON a.id_persona = p.id_persona
          LEFT JOIN doc_priorizado dp ON p.id_persona = dp.id_persona AND dp.rn = 1
          WHERE a.id_alumno = $1;
        `, [item.id_alumno]);

        const datosAlumno = resAlumno.rows[0];

        if (datosAlumno) {
          // 4. Mapear apellido/nombre singular que viene de la tabla persona
          detallesGenerados.push({
            apellidos: datosAlumno.apellidos || datosAlumno.apellidos,
            nombres: datosAlumno.nombres || datosAlumno.nombres,
            tipo_documento: datosAlumno.tipo_documento,
            numero_documento: datosAlumno.numero_documento,
            importeAnterior: item.importeActualVal,
            nuevoImporte: objeto.valorCuotaAplicar
          });
        }

      } catch (errItem) {
        // 5. Si falla un alumno individual, se acumula en no generados y NO rompe el bucle
        detallesNoGenerados.push({
          apellidos: item.apellidos,
          nombres: item.nombres,
          tipo_documento: item.tipo_documento,
          numero_documento: item.numero_documento,
          motivo: errItem.message || 'Error al actualizar registro'
        });
      }
    }

    await client.query("COMMIT");

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release(); // Liberar la conexión
  }

  // 6. Retornar con las claves que espera el Frontend ('detallesGenerados')
  return {
    ok: true,
    generados: detallesGenerados.length,
    noGenerados: detallesNoGenerados.length,
    detallesGenerados,
    detallesNoGenerados
  };
}


  async getEstadoDeuda(id) {


    try {

      const objetoBuscado = await pool.query(
        `SELECT  
            a.id_alumno,
            a.legajo,
            CONCAT(p.apellidos, ' ', p.nombres) AS NombreAlumno,
            g.nombre AS Grado, 
            COUNT(DISTINCT acc.id_alumno_cc) AS cantidad_cuotas_adeudadas,
            SUM(tcc.importe) AS SaldoTotal

        FROM transaccion_cuenta_corriente tcc
        INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno_cc = tcc.id_alumno_cc
        INNER JOIN alumno a ON a.id_alumno = acc.id_alumno
        INNER JOIN persona p ON p.id_persona = a.id_persona
        INNER JOIN (
            SELECT id_alumno, MAX(id_grado) AS ultGrado
            FROM alumno_datos_cursada
            GROUP BY id_alumno
        ) AS adc ON adc.id_alumno = a.id_alumno
        INNER JOIN grado g ON g.id_grado = adc.ultGrado

        WHERE a.id_alumno = $1 

        GROUP BY 
            a.id_alumno,
            a.legajo,
            p.apellidos,
            p.nombres,
            g.nombre
        HAVING SUM(tcc.importe) > 0;
        `,
       [id],
      );
      return objetoBuscado.rows;
    } catch (error) {
      throw error;
    }
  }

  async TipoUsuarios() {
    try {
      const objetoBuscado = await pool.query(`select * from tipos_usuarios`);
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }

async Usuarios(busqueda, identidadeducativa) {
  try { // 1. Abrir el bloque try
    const query = `
      WITH personas_documentos AS (
          SELECT 
              u.id_usuario AS id,
              per.apellidos,
              per.nombres,
              per.id_localidad_nacimiento AS id_localidad_nacimiento,
              ln.nombre AS localidad_nacimiento,
              per.id_localidad_residencia AS id_localidad_residencia,
              lr.nombre AS localidad_residencia,
              per.id_nacionalidad AS id_nacionalidad,
              n.nombre AS nacionalidad,
              u.usuario,
              u.email,
              doc.nombre_corto AS "tipoDocumento",
              ptd.numero AS "numeroDocumento",
              u.idtipousuario AS "idTipoUsuario",
              tu.tipousuario AS "tipousuario",
              u.activo,
              u.imagen,
              s.id_sexo,
              s.nombre AS "sexo",
              per.fecha_nacimiento AS fecha_nacimiento,
              per.telefono AS telefono,
              ROW_NUMBER() OVER (
                  PARTITION BY per.id_persona 
                  ORDER BY 
                      CASE UPPER(doc.nombre_corto)
                          WHEN 'DNI'  THEN 1
                          WHEN 'CUIL' THEN 2
                          WHEN 'CUIT' THEN 3
                          ELSE 4
                      END
              ) AS rn
          FROM persona per
          INNER JOIN persona_tipo_documento ptd ON per.id_persona = ptd.id_persona
          INNER JOIN tipo_documento doc        ON ptd.id_tipo_documento = doc.id_tipo_documento
          INNER JOIN usuarios u                ON per.id_persona = u.id_persona
		      INNER JOIN tipos_usuarios tu         ON u.idtipousuario = tu.idtipousuario
          INNER JOIN persona_sexo ps           ON per.id_persona = ps.id_persona
          INNER JOIN sexo s                    ON ps.id_sexo = s.id_sexo
          LEFT JOIN  localidad ln               ON per.id_localidad_nacimiento = ln.id_localidad
          LEFT JOIN  localidad lr               ON per.id_localidad_residencia = lr.id_localidad
          LEFT JOIN  nacionalidad n             ON per.id_nacionalidad = n.id_nacionalidad
          WHERE u.identidadeducativa = $2 -- <-- 2. $2 para la entidad educativa
      )
      SELECT id, apellidos, nombres, id_localidad_nacimiento, localidad_nacimiento, id_localidad_residencia, localidad_residencia, id_nacionalidad, nacionalidad, usuario, email, "tipoDocumento", "numeroDocumento", "idTipoUsuario", "tipousuario", activo, imagen, id_sexo, sexo, fecha_nacimiento, telefono
      FROM personas_documentos
      WHERE rn = 1
        AND (
            $1::text IS NULL 
            OR $1::text = '' 
            OR apellidos ILIKE '%' || $1 || '%'
            OR nombres ILIKE '%' || $1 || '%'
            OR usuario ILIKE '%' || $1 || '%'
            OR "numeroDocumento" ILIKE '%' || $1 || '%'
        ) -- <-- 3. $1 para la búsqueda
      ORDER BY apellidos, nombres;
    `;

    // 4. Un solo arreglo con ambos parámetros: [$1, $2]
    const resultado = await pool.query(query, [busqueda || '', identidadeducativa]);
    
    // 5. Retornar sólo los datos (rows)
    return resultado.rows; 
  } catch (error) {
    throw error; // Re-lanzar el error para que lo atrape el controllerUsuarios
  }
}


async TutoresSinUsuario(busqueda, identidadeducativa) {
  try { // 1. Abrir el bloque try
    const query = `
      WITH personas_documentos AS (
          SELECT 
              per.id_persona,
              per.apellidos,
              per.nombres,
              doc.nombre_corto AS "tipoDocumento",
              ptd.numero AS "numeroDocumento",
              ROW_NUMBER() OVER (
                  PARTITION BY per.id_persona 
                  ORDER BY 
                      CASE UPPER(doc.nombre_corto)
                          WHEN 'DNI'  THEN 1
                          WHEN 'CUIL' THEN 2
                          WHEN 'CUIT' THEN 3
                          ELSE 4
                      END
              ) AS rn
          FROM persona per
          INNER JOIN persona_tipo_documento ptd ON per.id_persona = ptd.id_persona
          INNER JOIN tipo_documento doc        ON ptd.id_tipo_documento = doc.id_tipo_documento
          INNER JOIN persona_allegado pa                ON per.id_persona = pa.id_persona
          INNER JOIN alumno a                   ON a.id_alumno = pa.id_alumno
          WHERE a.id_establecimiento = $2 -- <-- 2. $2 para la entidad educativa
          AND pa.id_persona NOT IN (SELECT id_persona FROM usuarios u WHERE u.identidadeducativa = $2)
      )
      SELECT id_persona, apellidos, nombres, "tipoDocumento", "numeroDocumento"
      FROM personas_documentos
      WHERE rn = 1
        AND (
            $1::text IS NULL 
            OR $1::text = '' 
            OR apellidos ILIKE '%' || $1 || '%'
            OR nombres ILIKE '%' || $1 || '%'
            OR "numeroDocumento" ILIKE '%' || $1 || '%'
        ) -- <-- 3. $1 para la búsqueda
      ORDER BY apellidos, nombres;
    `;

    // 4. Un solo arreglo con ambos parámetros: [$1, $2]
    const resultado = await pool.query(query, [busqueda || '', identidadeducativa]);
    
    // 5. Retornar sólo los datos (rows)
    return resultado.rows; 
  } catch (error) {
    throw error; // Re-lanzar el error para que lo atrape el controllerUsuarios
  }
}


async CrearUsuario(objeto) {
  console.log("Objeto recibido para alta:", objeto);

  // 1. Solicitar un cliente dedicado del pool para manejar la transacción
  const client = await pool.connect();

  try {
    // Iniciar la transacción en esta conexión
    await client.query("BEGIN");

    // -----------------------------------------------------------------
    // PASO 1: Comprobar si el NOMBRE DE USUARIO ya existe
    // -----------------------------------------------------------------
    const queryCheckUsuario = `SELECT id_usuario FROM usuarios WHERE usuario = $1;`;
    const resUsuarioExistente = await client.query(queryCheckUsuario, [objeto.usuario]);

    if (resUsuarioExistente.rows.length > 0) {
      const error = new Error("El nombre de usuario ya existe. Por favor ingrese uno diferente.");
      error.code = 'USUARIO_DUPLICADO';
      throw error; // Salta directamente al catch y ejecuta ROLLBACK
    }

    // -----------------------------------------------------------------
    // PASO 2: Comprobar si la Persona y su Documento ya existen
    // -----------------------------------------------------------------
    const idTipoDoc = objeto.idTipoDocumento ? parseInt(objeto.idTipoDocumento) : null;
    const numDoc = objeto.numeroDocumento || null;

    let idPersona = null;
    let personaExistia = false;

    if (idTipoDoc && numDoc) {
      const queryCheckDoc = `
        SELECT id_persona 
        FROM persona_tipo_documento 
        WHERE id_tipo_documento = $1 AND numero = $2;
      `;
      const resDocExistente = await client.query(queryCheckDoc, [idTipoDoc, numDoc]);

      if (resDocExistente.rows.length > 0) {
        // 🟢 La persona y su documento YA existen: reutilizamos id_persona
        idPersona = resDocExistente.rows[0].id_persona;
        personaExistia = true;
      }
    }

    // -----------------------------------------------------------------
    // PASO 3: Si la persona NO existía, la creamos con su documento
    // -----------------------------------------------------------------
    if (!idPersona) {
      // a) Datos para la tabla personas
      const persona = {
        apellidos: objeto.apellido || null,
        nombres: objeto.nombre || null,
        id_sexo: objeto.id_sexo ? parseInt(objeto.id_sexo) : null,
        correo_electronico: objeto.email || null,
        recibe_notif_x_correo: 'S',
        fecha_nacimiento: objeto.fechaNacimiento || objeto.fecha_nacimiento,
        telefono: objeto.telefono,
        id_localidad_nacimiento: objeto.id_localidad_nacimiento,
        id_localidad_residencia: objeto.id_localidad_residencia,
        id_nacionalidad: objeto.id_nacionalidad,
        activo: 'S',
        es_alumno: null,
        usuario: objeto.usuario,
        fecha_alta: new Date(),
        usuario_sistema: objeto.usuario_sistema,
        fecha_ultima_modificacion: new Date()
      };

      // Crear persona reutilizando el cliente en la transacción
      const resPersona = await this.createPerson(persona, client);
      idPersona = resPersona.id_persona;

      // b) Registrar Documento de la nueva persona
      const documento = {
        id_persona: idPersona,
        id_tipo_documento: idTipoDoc,
        numero: numDoc,
        activo: 'S',
        fecha_alta: new Date(),
        usuario_sistema: objeto.usuario_sistema || null
      };

      await this.registrarDocumentoPersona(documento, client);
    }

    // -----------------------------------------------------------------
    // PASO 4: Crear Registro en la Tabla Usuarios
    // -----------------------------------------------------------------
    const queryUsuario = `
      INSERT INTO usuarios (
        usuario,
        password_hash,
        nombre,
        email,
        activo,
        fecha_creacion,
        ultimo_login,
        idtipousuario,
        identidadeducativa,
        id_persona,
        imagen
      ) VALUES (
        $1,
        crypt($2, gen_salt('bf')),
        $3,
        $4,
        $5,
        clock_timestamp()::timestamp,
        $6,
        $7,
        $8,
        $9,
        $10
      ) 
      RETURNING id_usuario;
    `;

    const nombreMostrar = objeto.nombreAMostrar || `${objeto.apellido || ''}, ${objeto.nombre || ''}`.trim();

    const valoresUsuario = [
      objeto.usuario || null,                                                // $1
      objeto.password || null,                                               // $2
      nombreMostrar,                                                         // $3
      objeto.email || null,                                                  // $4
      objeto.activo !== undefined ? objeto.activo : true,                    // $5
      null,                                                                  // $6 (ultimo_login)
      objeto.idTipoUsuario ? parseInt(objeto.idTipoUsuario) : null,          // $7
      objeto.identidadeducativa ? parseInt(objeto.identidadeducativa) : null, // $8
      idPersona,                                                             // $9
      objeto.imagenUrl || objeto.imagen || null                              // $10
    ];

    const resUsuario = await client.query(queryUsuario, valoresUsuario);

    // Confirmar la transacción
    await client.query("COMMIT");

    // Retornamos el id_usuario junto con el flag de si la persona ya existía
    return {
      id_usuario: resUsuario.rows[0].id_usuario,
      personaExistia: personaExistia
    };

  } catch (error) {
    // Si algo falla, se revierten todos los inserts intermedios
    await client.query("ROLLBACK");
    console.error("❌ Error en transacción CrearUsuario:", error);
    throw error;
  } finally {
    // Liberar la conexión al pool
    client.release();
  }
}



async CrearUsuarioEnMasa(objeto) {
  const query = `
    WITH personas_documentos AS (
        SELECT 
            per.id_persona,
            ptd.numero AS usuario,
            per.apellidos || ', ' || per.nombres AS nombre,
            per.correo_electronico AS email,
            ROW_NUMBER() OVER (
                PARTITION BY per.id_persona 
                ORDER BY 
                    CASE UPPER(doc.nombre_corto)
                        WHEN 'DNI'  THEN 1
                        WHEN 'CUIL' THEN 2
                        WHEN 'CUIT' THEN 3
                        ELSE 4
                    END
            ) AS rn
        FROM persona per
        INNER JOIN persona_tipo_documento ptd ON per.id_persona = ptd.id_persona
        INNER JOIN tipo_documento doc ON ptd.id_tipo_documento = doc.id_tipo_documento
        WHERE per.id_persona = ANY($1::int[])
    )
    INSERT INTO usuarios (
        usuario,
        password_hash,
        nombre,
        email,
        activo,
        fecha_creacion,
        ultimo_login,
        idtipousuario,
        identidadeducativa,
        id_persona,
        imagen
    )
    SELECT 
        pd.usuario,
        crypt(pd.usuario, gen_salt('bf')) AS password_hash,
        pd.nombre,
        pd.email,
        true AS activo,
        clock_timestamp()::timestamp AS fecha_creacion,
        NULL AS ultimo_login,
        3 AS idtipousuario,
        $2 AS identidadeducativa,
        pd.id_persona,
        null
    FROM personas_documentos pd
    WHERE pd.rn = 1
    RETURNING id_usuario, usuario, id_persona;
  `;

  try {
    // Normaliza el array de IDs (soporta [45, 46] o [{id_persona: 45}, ...])
    const idsArray = objeto.tutoresIds
      .map((item) => parseInt(typeof item === 'object' ? (item.id_persona ?? item.id) : item))
      .filter(Boolean);

    if (idsArray.length === 0) {
      throw new Error("No se enviaron IDs de personas válidos para procesar.");
    }

    // Ejecución masiva en una sola consulta
    const resultado = await pool.query(query, [
      idsArray, 
      objeto.identidadeducativa
    ]);

    console.log(`✅ Usuarios creados exitosamente: ${resultado.rowCount}`);

    return resultado.rows;

  } catch (error) {
    console.error("❌ Error al crear usuarios en masa en PostgreSQL:", error);
    throw error;
  }
}


  async sexo() {
    try {
      const objetoBuscado = await pool.query(
        `select * from sexo`
      );
      return objetoBuscado.rows;
    } catch (error) {
      return error;
    }
  }



}

export { ContainerPg };
