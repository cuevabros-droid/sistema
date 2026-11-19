-- ====================================================================
-- Función PostgreSQL: fn_obtener_listado
-- Permite ejecutar consultas dinámicas para múltiples listados del sistema.
-- Devuelve un conjunto de objetos JSONB (SETOF JSONB).
-- ====================================================================

CREATE OR REPLACE FUNCTION fn_obtener_listado(
    p_tipo_listado TEXT,
    p_filtros      JSONB DEFAULT '{}'::jsonb
)
RETURNS SETOF JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_establecimiento INT;
BEGIN
    v_id_establecimiento := NULLIF(COALESCE(p_filtros->>'id_establecimiento', p_filtros->>'identidadeducativa'), '')::INT;

    CASE UPPER(TRIM(p_tipo_listado))

        -- ====================================================================
        -- 1. SALDO GENERAL DE ALUMNOS (Consolidado por alumno)
        -- ====================================================================
        WHEN 'SALDO_ALUMNOS' THEN
            RETURN QUERY
            SELECT to_jsonb(t)
            FROM (
                SELECT 
                    a.id_alumno AS alumno_id,
                    a.legajo,
                    CONCAT(p.apellidos, ', ', p.nombres) AS alumno_nombre,
                    COALESCE(td.numero, '') AS documento,
                    COALESCE(g.nombre, 'Sin Grado') AS grado,
                    COALESCE(SUM(tcc.importe), 0) AS saldo_total,
                    COUNT(DISTINCT CASE WHEN cuotas_deuda.deuda_cuota > 0 THEN acc.id_alumno_cc END) AS cuotas_adeudadas
                FROM alumno a
                INNER JOIN persona p ON a.id_persona = p.id_persona
                LEFT JOIN alumno_cuenta_corriente acc ON acc.id_alumno = a.id_alumno
                LEFT JOIN transaccion_cuenta_corriente tcc ON tcc.id_alumno_cc = acc.id_alumno_cc
                LEFT JOIN (
                    SELECT id_alumno_cc, SUM(importe) as deuda_cuota
                    FROM transaccion_cuenta_corriente
                    GROUP BY id_alumno_cc
                ) cuotas_deuda ON cuotas_deuda.id_alumno_cc = acc.id_alumno_cc
                LEFT JOIN (
                    SELECT td1.id_persona, td1.numero,
                           ROW_NUMBER() OVER (
                               PARTITION BY td1.id_persona 
                               ORDER BY CASE WHEN td1.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, td1.id_persona_tipo_documento ASC
                           ) AS rn
                    FROM persona_tipo_documento td1
                ) td ON td.id_persona = p.id_persona AND td.rn = 1
                LEFT JOIN (
                    SELECT id_alumno, MAX(id_grado) AS ult_grado
                    FROM alumno_datos_cursada
                    GROUP BY id_alumno
                ) adc ON adc.id_alumno = a.id_alumno
                LEFT JOIN grado g ON g.id_grado = adc.ult_grado
                WHERE (p.activo <> 'B' OR p.activo IS NULL)
                  -- Filtro por establecimiento / entidad educativa
                  AND (v_id_establecimiento IS NULL OR a.id_establecimiento = v_id_establecimiento)
                  -- Filtro opcional por alumno específico
                  AND (NOT (p_filtros ? 'alumno_id') OR a.id_alumno = (p_filtros->>'alumno_id')::INT)
                  -- Filtro opcional por grado / curso
                  AND (NOT (p_filtros ? 'curso_id') OR g.id_grado = (p_filtros->>'curso_id')::INT)
                GROUP BY a.id_alumno, a.legajo, p.apellidos, p.nombres, td.numero, g.nombre
                HAVING 
                    (COALESCE((p_filtros->>'solo_deudores')::BOOLEAN, false) = false 
                     OR COALESCE(SUM(tcc.importe), 0) > 0)
                ORDER BY p.apellidos, p.nombres
            ) t;

        -- ====================================================================
        -- 2. SALDO POR AÑO Y MES (Detallado por cuota/período)
        -- ====================================================================
        WHEN 'SALDO_POR_ANIO_MES' THEN
            RETURN QUERY
            SELECT to_jsonb(t)
            FROM (
                SELECT 
                    CASE 
                        WHEN acc.cuota ~ '^[0-9]{6}$' THEN RIGHT(acc.cuota, 4)::INT
                        WHEN acc.cuota ~ '^[0-9]{4}$' THEN acc.cuota::INT
                        ELSE TO_CHAR(acc.fecha_generacion_cc, 'YYYY')::INT
                    END AS anio,
                    CASE 
                        WHEN acc.cuota ~ '^[0-9]{6}$' THEN LEFT(acc.cuota, 2)::INT
                        WHEN acc.cuota ~ '^[0-9]{4}$' THEN 0
                        ELSE TO_CHAR(acc.fecha_generacion_cc, 'MM')::INT
                    END AS mes,
                    a.id_alumno AS alumno_id,
                    a.legajo,
                    CONCAT(p.apellidos, ', ', p.nombres) AS alumno_nombre,
                    COALESCE(td.numero, '') AS documento,
                    COALESCE(g.nombre, 'Sin Grado') AS grado,
                    acc.id_alumno_cc,
                    acc.cuota,
                    acc.descripcion AS descripcion_cuota,
                    COALESCE(NULLIF(acc.importe, 0), MAX(CASE WHEN tcc.importe > 0 THEN tcc.importe ELSE 0 END), 0) AS importe,
                    COALESCE(SUM(CASE WHEN tcc.importe < 0 THEN ABS(tcc.importe) ELSE 0 END), 0) AS importe_pagado,
                    COALESCE(SUM(tcc.importe), 0) AS saldo_periodo,
                    CASE 
                        WHEN COALESCE(SUM(tcc.importe), 0) <= 0 THEN 'PAGADO'
                        WHEN COALESCE(SUM(CASE WHEN tcc.importe < 0 THEN 1 ELSE 0 END), 0) > 0 THEN 'PAGO PARCIAL'
                        ELSE 'ADEUDADO'
                    END AS estado
                FROM alumno a
                INNER JOIN persona p ON a.id_persona = p.id_persona
                INNER JOIN alumno_cuenta_corriente acc ON acc.id_alumno = a.id_alumno
                LEFT JOIN transaccion_cuenta_corriente tcc ON tcc.id_alumno_cc = acc.id_alumno_cc
                LEFT JOIN (
                    SELECT td1.id_persona, td1.numero,
                           ROW_NUMBER() OVER (
                               PARTITION BY td1.id_persona 
                               ORDER BY CASE WHEN td1.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, td1.id_persona_tipo_documento ASC
                           ) AS rn
                    FROM persona_tipo_documento td1
                ) td ON td.id_persona = p.id_persona AND td.rn = 1
                LEFT JOIN (
                    SELECT id_alumno, MAX(id_grado) AS ult_grado
                    FROM alumno_datos_cursada
                    GROUP BY id_alumno
                ) adc ON adc.id_alumno = a.id_alumno
                LEFT JOIN grado g ON g.id_grado = adc.ult_grado
                WHERE (p.activo <> 'B' OR p.activo IS NULL)
                  -- Filtro por establecimiento
                  AND (v_id_establecimiento IS NULL OR a.id_establecimiento = v_id_establecimiento)
                  -- Filtro por año
                  AND (
                      NOT (p_filtros ? 'anio') 
                      OR (
                          CASE 
                              WHEN acc.cuota ~ '^[0-9]{6}$' THEN RIGHT(acc.cuota, 4)::INT
                              WHEN acc.cuota ~ '^[0-9]{4}$' THEN acc.cuota::INT
                              ELSE TO_CHAR(acc.fecha_generacion_cc, 'YYYY')::INT
                          END = (p_filtros->>'anio')::INT
                      )
                  )
                  -- Filtro por mes
                  AND (
                      NOT (p_filtros ? 'mes') 
                      OR (
                          CASE 
                              WHEN acc.cuota ~ '^[0-9]{6}$' THEN LEFT(acc.cuota, 2)::INT
                              WHEN acc.cuota ~ '^[0-9]{4}$' THEN 0
                              ELSE TO_CHAR(acc.fecha_generacion_cc, 'MM')::INT
                          END = (p_filtros->>'mes')::INT
                      )
                  )
                  -- Filtro opcional por alumno
                  AND (NOT (p_filtros ? 'alumno_id') OR a.id_alumno = (p_filtros->>'alumno_id')::INT)
                  -- Filtro opcional por curso / grado
                  AND (NOT (p_filtros ? 'curso_id') OR g.id_grado = (p_filtros->>'curso_id')::INT)
                GROUP BY 
                    a.id_alumno, a.legajo, p.apellidos, p.nombres, td.numero, g.nombre,
                    acc.id_alumno_cc, acc.cuota, acc.descripcion, acc.fecha_generacion_cc, acc.importe
                HAVING 
                    (COALESCE((p_filtros->>'solo_deudores')::BOOLEAN, false) = false 
                     OR COALESCE(SUM(tcc.importe), 0) > 0)
                ORDER BY anio DESC, mes DESC, p.apellidos, p.nombres
            ) t;

        -- ====================================================================
        -- 3. CANTIDAD DE CUOTAS ADEUDADAS (Ranking de morosidad)
        -- ====================================================================
        WHEN 'CUOTAS_ADEUDADAS' THEN
            RETURN QUERY
            SELECT to_jsonb(t)
            FROM (
                SELECT 
                    a.id_alumno AS alumno_id,
                    a.legajo,
                    CONCAT(p.apellidos, ', ', p.nombres) AS alumno_nombre,
                    COALESCE(td.numero, '') AS documento,
                    COALESCE(g.nombre, 'Sin Grado') AS grado,
                    deuda.cantidad_cuotas_vencidas,
                    deuda.deuda_acumulada,
                    deuda.periodos_adeudados,
                    COALESCE(tutor.nombre_tutor, '') AS tutor_nombre,
                    COALESCE(tutor.telefono_tutor, '') AS tutor_telefono
                FROM alumno a
                INNER JOIN persona p ON a.id_persona = p.id_persona
                INNER JOIN (
                    SELECT 
                        acc.id_alumno,
                        COUNT(DISTINCT acc.id_alumno_cc) AS cantidad_cuotas_vencidas,
                        SUM(tcc.importe) AS deuda_acumulada,
                        STRING_AGG(DISTINCT acc.cuota, ', ' ORDER BY acc.cuota) AS periodos_adeudados
                    FROM alumno_cuenta_corriente acc
                    INNER JOIN transaccion_cuenta_corriente tcc ON tcc.id_alumno_cc = acc.id_alumno_cc
                    WHERE (
                        NOT (p_filtros ? 'anio_hasta') 
                        OR (
                            CASE 
                                WHEN acc.cuota ~ '^[0-9]{6}$' THEN RIGHT(acc.cuota, 4)::INT
                                WHEN acc.cuota ~ '^[0-9]{4}$' THEN acc.cuota::INT
                                ELSE TO_CHAR(acc.fecha_generacion_cc, 'YYYY')::INT
                            END <= (p_filtros->>'anio_hasta')::INT
                        )
                    )
                    GROUP BY acc.id_alumno
                    HAVING SUM(tcc.importe) > 0
                ) deuda ON deuda.id_alumno = a.id_alumno
                LEFT JOIN (
                    SELECT td1.id_persona, td1.numero,
                           ROW_NUMBER() OVER (
                               PARTITION BY td1.id_persona 
                               ORDER BY CASE WHEN td1.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, td1.id_persona_tipo_documento ASC
                           ) AS rn
                    FROM persona_tipo_documento td1
                ) td ON td.id_persona = p.id_persona AND td.rn = 1
                LEFT JOIN (
                    SELECT id_alumno, MAX(id_grado) AS ult_grado
                    FROM alumno_datos_cursada
                    GROUP BY id_alumno
                ) adc ON adc.id_alumno = a.id_alumno
                LEFT JOIN grado g ON g.id_grado = adc.ult_grado
                LEFT JOIN (
                    SELECT 
                        pa.id_alumno,
                        CONCAT(pt.apellidos, ' ', pt.nombres) AS nombre_tutor,
                        pt.telefono AS telefono_tutor,
                        ROW_NUMBER() OVER (PARTITION BY pa.id_alumno ORDER BY pa.id_persona_allegado ASC) as rn
                    FROM persona_allegado pa
                    INNER JOIN persona pt ON pt.id_persona = pa.id_persona
                    WHERE pa.activo <> 'N' OR pa.activo IS NULL
                ) tutor ON tutor.id_alumno = a.id_alumno AND tutor.rn = 1
                WHERE (p.activo <> 'B' OR p.activo IS NULL)
                  AND (v_id_establecimiento IS NULL OR a.id_establecimiento = v_id_establecimiento)
                  AND (NOT (p_filtros ? 'curso_id') OR g.id_grado = (p_filtros->>'curso_id')::INT)
                  AND (NOT (p_filtros ? 'min_cuotas') OR deuda.cantidad_cuotas_vencidas >= (p_filtros->>'min_cuotas')::INT)
                ORDER BY deuda.cantidad_cuotas_vencidas DESC, deuda.deuda_acumulada DESC, p.apellidos
            ) t;

        ELSE
            RAISE EXCEPTION 'Tipo de listado no reconocido: %', p_tipo_listado;
    END CASE;
END;
$$;

