-- ========================================================================
-- Función Dinámica de Reportes para PostgreSQL: fn_ejecutar_reporte
-- Permite recibir el tipo de reporte y parámetros dinámicos en formato JSONB.
-- Retorna el resultado como JSONB para compatibilidad dinámica con cualquier listado.
-- ========================================================================

CREATE OR REPLACE FUNCTION fn_ejecutar_reporte(
    p_tipo_reporte TEXT,
    p_parametros JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_resultado JSONB;
    v_anio TEXT;
    v_mes TEXT;
    v_id_establecimiento INT;
    v_estado_filtro TEXT;
    v_id_grado INT;
BEGIN
    CASE LOWER(TRIM(p_tipo_reporte))
        -- -------------------------------------------------------------
        -- REPORTE 1: Saldos de Alumnos (Estado de cuenta por cuota/año)
        -- Parámetros esperados en JSONB:
        --   - anio: ej. '2023', '2024', etc. (opcional, null para todos)
        --   - mes: ej. '03' (Marzo), '04' (Abril), 'TODOS', etc.
        --   - identidadeducativa: ej. 1 (opcional, filtra por establecimiento)
        --   - estado: 'TODOS', 'SOLO_DEUDA' o 'PAGADO'
        --   - id_grado: id del grado (opcional)
        -- -------------------------------------------------------------
        WHEN 'saldos_alumnos' THEN
            v_anio := NULLIF(TRIM(p_parametros->>'anio'), '');
            v_mes := NULLIF(TRIM(p_parametros->>'mes'), '');
            v_id_establecimiento := NULLIF(p_parametros->>'identidadeducativa', '')::INT;
            IF v_id_establecimiento IS NULL THEN
                v_id_establecimiento := NULLIF(p_parametros->>'id_establecimiento', '')::INT;
            END IF;
            v_estado_filtro := COALESCE(NULLIF(UPPER(TRIM(p_parametros->>'estado')), ''), 'TODOS');
            v_id_grado := NULLIF(p_parametros->>'id_grado', '')::INT;

            -- Normalizar mes a 2 dígitos si es numérico ('3' -> '03')
            IF v_mes IS NOT NULL AND v_mes ~ '^[0-9]{1}$' THEN
                v_mes := LPAD(v_mes, 2, '0');
            END IF;

            SELECT COALESCE(jsonb_agg(fila ORDER BY fila.apellidos, fila.nombres, fila.cuota), '[]'::jsonb)
            INTO v_resultado
            FROM (
                SELECT 
                    a.id_alumno,
                    a.legajo,
                    p.id_persona,
                    p.apellidos,
                    p.nombres,
                    CONCAT(p.apellidos, ', ', p.nombres) AS alumno_nombre_completo,
                    COALESCE(td.numero, '') AS documento,
                    g.id_grado,
                    COALESCE(g.nombre, 'Sin Grado') AS grado,
                    niv.id_nivel,
                    COALESCE(niv.nombre, '') AS nivel,
                    ee.identidadeducativa,
                    COALESCE(ee.entidadeducativa, '') AS institucion,
                    acc.id_alumno_cc,
                    acc.cuota,
                    acc.descripcion AS descripcion_cuota,
                    acc.id_cargo_cuenta_corriente,
                    ccc.nombre AS tipo_cargo,
                    
                    -- Extracción de Año y Mes
                    CASE 
                        WHEN acc.cuota ~ '^[0-9]{6}$' THEN RIGHT(acc.cuota, 4)
                        WHEN acc.cuota ~ '^[0-9]{4}$' THEN acc.cuota
                        ELSE TO_CHAR(acc.fecha_generacion_cc, 'YYYY')
                    END AS anio,
                    
                    CASE 
                        WHEN acc.cuota ~ '^[0-9]{6}$' THEN LEFT(acc.cuota, 2)
                        WHEN acc.cuota ~ '^[0-9]{4}$' THEN '00'
                        ELSE TO_CHAR(acc.fecha_generacion_cc, 'MM')
                    END AS mes_codigo,

                    CASE 
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '01' THEN 'Enero'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '02' THEN 'Febrero'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '03' THEN 'Marzo'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '04' THEN 'Abril'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '05' THEN 'Mayo'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '06' THEN 'Junio'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '07' THEN 'Julio'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '08' THEN 'Agosto'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '09' THEN 'Septiembre'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '10' THEN 'Octubre'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '11' THEN 'Noviembre'
                        WHEN acc.cuota ~ '^[0-9]{6}$' AND LEFT(acc.cuota, 2) = '12' THEN 'Diciembre'
                        WHEN acc.id_cargo_cuenta_corriente = 1 THEN 'Matrícula / Inscripción'
                        ELSE 'Cuota / Concepto'
                    END AS mes_nombre,

                    -- Importes
                    COALESCE(NULLIF(acc.importe, 0), MAX(CASE WHEN tcc.importe > 0 THEN tcc.importe ELSE 0 END), 0) AS importe_original,
                    COALESCE(SUM(CASE WHEN tcc.importe < 0 THEN ABS(tcc.importe) ELSE 0 END), 0) AS total_pagado,
                    COALESCE(SUM(tcc.importe), 0) AS saldo_pendiente,
                    
                    CASE 
                        WHEN COALESCE(SUM(tcc.importe), 0) <= 0 THEN 'PAGADO'
                        WHEN COALESCE(SUM(CASE WHEN tcc.importe < 0 THEN 1 ELSE 0 END), 0) > 0 THEN 'PAGO PARCIAL'
                        ELSE 'ADEUDADO'
                    END AS estado_pago,

                    MAX(tcc.fecha_pago) AS ultima_fecha_pago,
                    
                    -- Tutor
                    COALESCE(tutor.nombre_tutor, '') AS tutor_nombre,
                    COALESCE(tutor.telefono_tutor, '') AS tutor_telefono

                FROM alumno a
                INNER JOIN persona p ON a.id_persona = p.id_persona
                LEFT JOIN alumno_cuenta_corriente acc ON acc.id_alumno = a.id_alumno
                LEFT JOIN transaccion_cuenta_corriente tcc ON tcc.id_alumno_cc = acc.id_alumno_cc
                LEFT JOIN cargo_cuenta_corriente ccc ON ccc.id_cargo_cuenta_corriente = acc.id_cargo_cuenta_corriente
                LEFT JOIN entidades_educativas ee ON ee.identidadeducativa = a.id_establecimiento
                
                -- Documento del Alumno
                LEFT JOIN (
                    SELECT td1.id_persona, td1.numero,
                           ROW_NUMBER() OVER (
                               PARTITION BY td1.id_persona 
                               ORDER BY CASE WHEN td1.id_tipo_documento = 8 THEN 0 ELSE 1 END ASC, td1.id_persona_tipo_documento ASC
                           ) AS rn
                    FROM persona_tipo_documento td1
                ) td ON td.id_persona = p.id_persona AND td.rn = 1

                -- Grado y Nivel
                LEFT JOIN (
                    SELECT id_alumno, MAX(id_grado) AS ult_grado
                    FROM alumno_datos_cursada
                    GROUP BY id_alumno
                ) adc ON adc.id_alumno = a.id_alumno
                LEFT JOIN grado g ON g.id_grado = adc.ult_grado
                LEFT JOIN nivel niv ON niv.id_nivel = g.id_nivel

                -- Tutor principal
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
                  AND acc.id_alumno_cc IS NOT NULL
                  -- Filtro por establecimiento
                  AND (v_id_establecimiento IS NULL OR a.id_establecimiento = v_id_establecimiento)
                  -- Filtro por grado
                  AND (v_id_grado IS NULL OR g.id_grado = v_id_grado)
                  -- Filtro por año
                  AND (
                      v_anio IS NULL 
                      OR (
                          CASE 
                              WHEN acc.cuota ~ '^[0-9]{6}$' THEN RIGHT(acc.cuota, 4)
                              WHEN acc.cuota ~ '^[0-9]{4}$' THEN acc.cuota
                              ELSE TO_CHAR(acc.fecha_generacion_cc, 'YYYY')
                          END = v_anio
                      )
                  )
                  -- Filtro por mes / cuota
                  AND (
                      v_mes IS NULL 
                      OR v_mes = 'TODOS'
                      OR (
                          CASE 
                              WHEN acc.cuota ~ '^[0-9]{6}$' THEN LEFT(acc.cuota, 2)
                              WHEN acc.cuota ~ '^[0-9]{4}$' THEN '00'
                              ELSE TO_CHAR(acc.fecha_generacion_cc, 'MM')
                          END = v_mes
                      )
                  )

                GROUP BY 
                    a.id_alumno, a.legajo, p.id_persona, p.apellidos, p.nombres,
                    td.numero, g.id_grado, g.nombre, niv.id_nivel, niv.nombre,
                    ee.identidadeducativa, ee.entidadeducativa, acc.id_alumno_cc,
                    acc.cuota, acc.descripcion, acc.id_cargo_cuenta_corriente,
                    ccc.nombre, acc.fecha_generacion_cc, acc.importe,
                    tutor.nombre_tutor, tutor.telefono_tutor

                HAVING (
                    v_estado_filtro = 'TODOS'
                    OR (v_estado_filtro IN ('DEUDA', 'SOLO_DEUDA', 'IMPAGO') AND COALESCE(SUM(tcc.importe), 0) > 0)
                    OR (v_estado_filtro = 'PAGADO' AND COALESCE(SUM(tcc.importe), 0) <= 0)
                )
            ) fila;

            RETURN v_resultado;

        -- -------------------------------------------------------------
        -- AGREGAR AQUÍ FUTUROS REPORTES:
        -- WHEN 'otro_reporte' THEN ...
        -- -------------------------------------------------------------

        ELSE
            RETURN jsonb_build_object(
                'error', true,
                'mensaje', FORMAT('El tipo de reporte "%s" no está configurado en fn_ejecutar_reporte.', p_tipo_reporte)
            );
    END CASE;
END;
$$;

