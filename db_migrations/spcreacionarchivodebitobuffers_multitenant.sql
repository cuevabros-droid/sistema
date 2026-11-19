-- ====================================================================
-- MIGRACIÓN: Soporte multi-establecimiento para Débito Automático
-- ====================================================================

-- 1. DROP Y RECREATE DE generararchivodebito CON idestablecimiento
DROP FUNCTION IF EXISTS public.generararchivodebito(integer, integer);

CREATE OR REPLACE FUNCTION public.generararchivodebito(
    idmarcatarjeta integer, 
    idmediopago integer,
    idestablecimiento integer DEFAULT NULL
)
RETURNS TABLE(
    orden integer, 
    id_alumno_cc integer, 
    numero_tarjeta character, 
    numero_factura text, 
    codigo_transaccion text, 
    importe numeric, 
    codigo_alta text, 
    fecha_presentacion text, 
    hora_presentacion text, 
    contenido text
)
LANGUAGE plpgsql
AS $function$
DECLARE RutaArchivo TEXT;

BEGIN 

	SELECT valor INTO RutaArchivo
	FROM Parametros_Sistema
	WHERE Parametro = 'ruta_archivos_recibidos';
 
	RETURN QUERY
	-- ENCABEZADO
	SELECT 1 AS Orden, 0 AS Id_alumno_cc, ' ' AS numero_tarjeta, '' AS numero_factura, '' AS codigo_transaccion,
		    0 AS Importe, '' AS codigo_alta, 
		  -- FECHA DE PRESENTACIÓN DEL TXT
	            CONCAT(DATE_PART('year', NOW()),  
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MONTH', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('DAY', NOW()), '99'))), 2, '0')) AS fecha_presentacion,
		    -- HORA DEL ARMADO DEL ARCHIVO TXT
	            CONCAT(LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('HOUR', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MINUTE', NOW()), '99'))), 2, '0')) AS hora_presentacion,
		  -- REGISTRO
		    CONCAT('0', 
		    -- TARJETA MARCA Y TIPO
		    CASE WHEN idMarcaTarjeta = 1 AND idMedioPago = 3 THEN 'DEBLIQD ' 
		         WHEN idMarcaTarjeta = 1 AND idMedioPago = 4 THEN 'DEBLIQC '
		         WHEN idMarcaTarjeta = 2 AND idMedioPago = 4 THEN 'DEBLIMC '
		    END,
		    -- N° ESTABLECIMIENTO PARA DÉBITO AUTOMÁTICO
		     CASE WHEN idMarcaTarjeta = 1 THEN '0071227300' 
 		          WHEN idMarcaTarjeta = 2 THEN '0071227318'
		    END,
		    -- CAMPO FIJO
		    RPAD('900000', 10, ' '),
	            -- FECHA DE PRESENTACIÓN DEL TXT
	            CONCAT(DATE_PART('year', NOW()),  
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MONTH', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('DAY', NOW()), '99'))), 2, '0')),
		    -- HORA DEL ARMADO DEL ARCHIVO TXT
	            CONCAT(LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('HOUR', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MINUTE', NOW()), '99'))), 2, '0')),
	            -- DEBITOS A LIQUIDAR (SE COMPLETA CON 0)
	            '0',
	            -- CAMPO FIJO (2 ESPACIOS)
	            RPAD('', 2, ' '),
	            -- 55 CARACTERES. SE USA ESTE CAMPO PARA AGREGAR INFO ADICIONAL.
		    RPAD('', 55, ' '),
		    -- FIN
		    '*'
		     ) AS Contenido
	UNION 
	-- CUERPO
	SELECT 2 AS Orden, 
			CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN CCAMax.id_alumno_cc 
					      WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN CCAMin.id_alumno_cc
					      WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN 90000000 + R1.id_alumno 
			END AS Id_alumno_cc,
		   pt.numero_tarjeta AS numero_tarjeta,
		  LPAD(LTRIM(RTRIM(TO_CHAR(
			CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN CCAMax.id_alumno_cc 
					      WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN CCAMin.id_alumno_cc
					      WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN 90000000 + R1.id_alumno 
			END
			, '99999999'))), 8, '0') AS numero_factura, 
			'0005' AS codigo_transaccion,
		    CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' 
					THEN CCAMax.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' 	
					THEN CCAMin.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' 
				THEN R1.TotalAdeudado
			END AS Importe, 
			'E' AS codigo_alta, '' AS fecha_presentacion, '' AS hora_presentacion,
		CONCAT(
		-- REGISTRO
		'1',
		-- NÚMERO DE TARJETA
		pt.numero_tarjeta,
		-- CAMPO FIJO (3 ESPACIOS)
		RPAD('', 3, ' '),
		-- NRO. DE FACTURA 
		LPAD(LTRIM(RTRIM(TO_CHAR(
			CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN CCAMax.id_alumno_cc 
					      WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN CCAMin.id_alumno_cc
					      WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN 90000000 + R1.id_alumno 
			END
			, '99999999'))), 8, '0'),
		-- FECHA DE PRESENTACIÓN DEL TXT
		CONCAT(DATE_PART('YEAR', NOW()),  
				   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MONTH', NOW()), '99'))), 2, '0'), 
				   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('DAY', NOW()), '99'))), 2, '0')),
		-- CÓDIGO DE TRANSACCIÓN
		'0005',
		-- IMPORTE
		CONCAT(
			CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' 
					THEN lpad(ltrim(rtrim(substring(to_char(CCAMax.IMPORTE, '999999999999.99') from 1 for 13))), 13, '0')
			     WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' 	
					THEN lpad(ltrim(rtrim(substring(to_char(CCAMin.IMPORTE, '999999999999.99') from 1 for 13))), 13, '0')
			     WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' 
				THEN lpad(ltrim(rtrim(substring(to_char(R1.TotalAdeudado, '999999999999.99') from 1 for 13))), 13, '0')
			END
		,
			CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN ltrim(rtrim(substring(to_char(CCAMax.IMPORTE, '999999999999.99') from 15 for 2)))
			     WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN ltrim(rtrim(substring(to_char(CCAMin.IMPORTE, '999999999999.99') from 15 for 2)))
			     WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN ltrim(rtrim(substring(to_char(R1.TotalAdeudado, '999999999999.99') from 15 for 2)))
			END
		),
		
		-- IDCLIENTE
		LPAD(LTRIM(RTRIM(TO_CHAR(PT.ID_Alumno, '99999999'))), 15, '0'),
		-- CÓDIGO DE ALTA DE IDENTIFICADOR
		'E',
		-- CAMPO FIJO
		RPAD('', 28, ' '),
		-- FIN
		'*'
		) AS Contenido
	 FROM Persona P
		 INNER JOIN alumno A ON A.id_persona = P.id_Persona
			    AND A.Regular = 'S'	
			    AND P.es_alumno = 'S'
			    AND P.activo = 'S'
			    AND (idestablecimiento IS NULL OR A.id_establecimiento = idestablecimiento)
		 INNER JOIN alumno_tarjeta PT ON PT.Id_alumno = A.Id_alumno
			      AND PT.id_Marca_tarjeta = idMarcaTarjeta 
			      AND PT.id_medio_pago = idMedioPago
			      AND PT.activo = 'S' 			      	
		 INNER JOIN parametros_sistema PS ON PS.Parametro = 'criterio_generacion_cuota' 	 
		 INNER JOIN 
		(SELECT Id_Alumno, 
				 MIN(AC.cuota) AS MinCuota, 
				 MAX(AC.cuota) AS MaxCuota, 
				 SUM(TC.importe) AS TotalAdeudado 
			 FROM alumno_cuenta_corriente AC
			 INNER JOIN transaccion_cuenta_corriente TC ON TC.id_alumno_cc = AC.id_Alumno_cc
			  WHERE TC.id_estado_cuota IN (1, 4) 
			    AND (CASE WHEN right(trim(cuota), 4) ~ '^[0-9]{4}$' THEN CAST(right(trim(cuota), 4) AS INTEGER) ELSE NULL END) = EXTRACT(YEAR FROM NOW())
			    -- agregado para que no tome la inscripcion anual
			    AND LENGTH(TRIM(cuota)) = 6
			 GROUP BY Id_Alumno) AS R1 ON R1.id_alumno = A.id_Alumno		 
		 LEFT JOIN alumno_cuenta_corriente CAMin ON CAMin.id_alumno = A.id_Alumno 
						     AND LTRIM(RTRIM(CAMin.cuota)) = LTRIM(RTRIM(r1.MinCuota))
		 LEFT JOIN 
			(SELECT t.id_alumno_cc, SUM(t.Importe) AS Importe 
			FROM transaccion_cuenta_corriente t
			GROUP BY t.id_alumno_cc) CCAMin ON CCAMin.id_alumno_cc = CAMin.id_Alumno_cc
		-- Obtenemos ultima cuota e Inscripción	
		 LEFT JOIN alumno_cuenta_corriente CAMax ON CAMax.id_alumno = A.id_Alumno 
						     AND (LTRIM(RTRIM(CAMax.cuota)) = LTRIM(RTRIM(r1.MaxCuota))
								  OR (CAMax.cuota = (select max(right(trim(cuota), 4)) from alumno_cuenta_corriente where right(trim(cuota), 4) ~ '^[0-9]{4}$')  
									  AND EXTRACT(MONTH FROM NOW()) IN (11, 12) ) 
								  	  AND CAMax.id_alumno_cc IN
								  		 (select MAX(acc.id_alumno_cc) from alumno_cuenta_corriente acc
										  where cuota = (select max(right(trim(cuota), 4)) from alumno_cuenta_corriente where right(trim(cuota), 4) ~ '^[0-9]{4}$')  
										 group by id_alumno)
								 OR 
								  (CAMAX.id_cargo_cuenta_corriente = 3 
								  AND EXTRACT(YEAR FROM CAMAX.fecha_generacion_cc) = EXTRACT(YEAR FROM NOW()) )
								 )
		 LEFT JOIN 
			(SELECT t2.id_alumno_cc, SUM(t2.Importe) AS Importe 
			FROM transaccion_cuenta_corriente t2
			GROUP BY t2.id_alumno_cc) CCAMax ON CCAMax.id_alumno_cc = CAMax.id_alumno_cc	
 
	UNION 
	-- CIERRE
	SELECT 3 AS Orden, 1 AS Id_alumno_cc,'0' AS numero_tarjeta,'' AS numero_factura, '' AS codigo_transaccion,
		    0 AS Importe, '' AS codigo_alta, '' AS fecha_presentacion, '' AS hora_presentacion,
		CONCAT(
		-- REGISTRO
		'9',
		-- TARJETA MARCA Y TIPO
		CASE 	WHEN idMarcaTarjeta = 1 AND idMedioPago = 3 THEN 'DEBLIQD ' 
			WHEN idMarcaTarjeta = 1 AND idMedioPago = 4 THEN 'DEBLIQC '
			WHEN idMarcaTarjeta = 2 AND idMedioPago = 4 THEN 'DEBLIMC '
		    END,
		    -- N° ESTABLECIMIENTO PARA DÉBITO AUTOMÁTICO
		     CASE WHEN idMarcaTarjeta = 1 THEN '0071227300' 
			  WHEN idMarcaTarjeta = 2 THEN '0071227318'
		    END,
		    -- CAMPO FIJO
		    RPAD('900000', 10, ' '),
	            -- FECHA DE PRESENTACIÓN DEL TXT
	            CONCAT(DATE_PART('YEAR', NOW()),  
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MONTH', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('DAY', NOW()), '99'))), 2, '0')),
		    -- HORA DEL ARMADO DEL ARCHIVO TXT
	            CONCAT(LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('HOUR', NOW()), '99'))), 2, '0'), 
			   LPAD(RTRIM(LTRIM(TO_CHAR(DATE_PART('MINUTE', NOW()), '99'))), 2, '0')),
	            -- CANTIDAD TOTAL DE DÉBITOS
	            LPAD(LTRIM(RTRIM(TO_CHAR(COUNT(*), '9999'))), 7, '0'),
	            -- IMPORTE DE TODOS LOS DÉBITOS
	            CONCAT(SUBSTRING(LPAD(LTRIM(RTRIM(TO_CHAR(SUM( 
			 CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN CCAMax.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN CCAMin.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN R1.TotalAdeudado
			END
	            ), '9999999999999.99'))), 16, '0') FROM 1 FOR 13),

		   SUBSTRING(LPAD(LTRIM(RTRIM(TO_CHAR(SUM( 
			 CASE WHEN ltrim(rtrim(PS.Valor)) = 'ultima_generada' THEN CCAMax.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'primera_generada' THEN CCAMin.IMPORTE
			     WHEN ltrim(rtrim(PS.Valor)) = 'total_adeudado' THEN R1.TotalAdeudado
			END
	            ), '9999999999999.99'))), 16, '0') FROM 15 FOR 2)

	            ),	
	            -- 37 CARACTERES. SE USA ESTE CAMPO PARA AGREGAR INFO ADICIONAL.
		    RPAD('', 36, ' '),
		    -- FIN
		    '*'
		     ) AS Contenido
		 FROM Persona P
		 INNER JOIN alumno A ON A.id_persona = P.id_Persona
				    AND A.Regular = 'S'	
				    AND P.es_alumno = 'S'
				    AND P.activo = 'S'
				    AND (idestablecimiento IS NULL OR A.id_establecimiento = idestablecimiento)
		 INNER JOIN alumno_tarjeta PT ON PT.Id_alumno = A.Id_Alumno
			      AND PT.id_Marca_tarjeta = idMarcaTarjeta 
			      AND PT.id_medio_pago = idMedioPago
			      AND PT.activo = 'S' 			      	
		 INNER JOIN parametros_sistema PS ON PS.Parametro = 'criterio_generacion_cuota' 	 
		 INNER JOIN 
	(SELECT Id_Alumno, 
				 MIN(AC.cuota) AS MinCuota, 
				 MAX(AC.cuota) AS MaxCuota, 
				 SUM(TC.importe) AS TotalAdeudado 
			 FROM alumno_cuenta_corriente AC
			 INNER JOIN transaccion_cuenta_corriente TC ON TC.id_alumno_cc = AC.id_Alumno_cc
			  WHERE TC.id_estado_cuota IN (1, 4) 
			    AND (CASE WHEN right(trim(cuota), 4) ~ '^[0-9]{4}$' THEN CAST(right(trim(cuota), 4) AS INTEGER) ELSE NULL END) = EXTRACT(YEAR FROM NOW())
			    -- agregado para que no tome la inscripcion anual
			    AND LENGTH(TRIM(cuota)) = 6
			 GROUP BY Id_Alumno) AS R1 ON R1.id_alumno = A.id_Alumno		 
		 LEFT JOIN alumno_cuenta_corriente CAMin ON CAMin.id_alumno = A.id_Alumno 
						     AND LTRIM(RTRIM(CAMin.cuota)) = LTRIM(RTRIM(r1.MinCuota))
		 LEFT JOIN 
			(SELECT t.id_alumno_cc, SUM(t.Importe) AS Importe 
			FROM transaccion_cuenta_corriente t
			GROUP BY t.id_alumno_cc) CCAMin ON CCAMin.id_alumno_cc = CAMin.id_Alumno_cc
		-- Obtenemos ultima cuota e Inscripción	
		 LEFT JOIN alumno_cuenta_corriente CAMax ON CAMax.id_alumno = A.id_Alumno 
						     AND (LTRIM(RTRIM(CAMax.cuota)) = LTRIM(RTRIM(r1.MaxCuota))
								 OR (CAMax.cuota = (select max(right(trim(cuota), 4)) from alumno_cuenta_corriente where right(trim(cuota), 4) ~ '^[0-9]{4}$')  
									  AND EXTRACT(MONTH FROM NOW()) IN (11, 12) ) 
								  	  AND CAMax.id_alumno_cc IN
								  		 (select MAX(acc.id_alumno_cc) from alumno_cuenta_corriente acc
										  where cuota = (select max(right(trim(cuota), 4)) from alumno_cuenta_corriente where right(trim(cuota), 4) ~ '^[0-9]{4}$')  
										 group by id_alumno)
								 OR 
								  (CAMAX.id_cargo_cuenta_corriente = 3 
								  AND EXTRACT(YEAR FROM CAMAX.fecha_generacion_cc) = EXTRACT(YEAR FROM NOW()) )
								 )
		 LEFT JOIN 
			(SELECT t2.id_alumno_cc, SUM(t2.Importe) AS Importe 
			FROM transaccion_cuenta_corriente t2
			GROUP BY t2.id_alumno_cc) CCAMax ON CCAMax.id_alumno_cc = CAMax.id_alumno_cc	
		ORDER BY Orden;		

END;
$function$;


-- 2. DROP Y RECREATE DE spcreacionarchivodebitobuffers
DROP FUNCTION IF EXISTS public.spcreacionarchivodebitobuffers();
DROP FUNCTION IF EXISTS public.spcreacionarchivodebitobuffers(text);
DROP FUNCTION IF EXISTS public.spcreacionarchivodebitobuffers(integer);
DROP FUNCTION IF EXISTS public.spcreacionarchivodebitobuffers(integer, text);

CREATE OR REPLACE FUNCTION public.spcreacionarchivodebitobuffers(
    idestablecimiento integer DEFAULT NULL,
    ruta_base text DEFAULT ''
)
RETURNS TABLE(archivo_visa_debito bytea, archivo_visa_credito bytea, archivo_mastercard_credito bytea) 
LANGUAGE 'plpgsql'
COST 100
VOLATILE PARALLEL UNSAFE
ROWS 1000
AS $BODY$

DECLARE
    contenido_visa_debito TEXT;
    contenido_visa_credito TEXT;
    contenido_mastercard_credito TEXT;

BEGIN

    ------------------------------------------------------------------
    -- VISA DÉBITO
    ------------------------------------------------------------------

    SELECT COALESCE(
        string_agg(contenido, E'\r\n'),
        ''
    )
    INTO contenido_visa_debito
    FROM generarArchivoDebito(1, 3, idestablecimiento);

    ------------------------------------------------------------------
    -- VISA CRÉDITO
    ------------------------------------------------------------------

    SELECT COALESCE(
        string_agg(contenido, E'\r\n'),
        ''
    )
    INTO contenido_visa_credito
    FROM generarArchivoDebito(1, 4, idestablecimiento);

    ------------------------------------------------------------------
    -- MASTERCARD CRÉDITO
    ------------------------------------------------------------------

    SELECT COALESCE(
        string_agg(contenido, E'\r\n'),
        ''
    )
    INTO contenido_mastercard_credito
    FROM generarArchivoDebito(2, 4, idestablecimiento);

    ------------------------------------------------------------------
    -- LIQUIDACIÓN VISA DÉBITO
    ------------------------------------------------------------------

    INSERT INTO Liquidacion_encabezado (
        marca_tipo_tarjeta,
        fecha_presentacion_txt,
        hora_armado_txt
    )
    SELECT
        1 AS marca_tipo_tarjeta,
        fecha_presentacion,
        hora_presentacion
    FROM generarArchivoDebito(1, 3, idestablecimiento)
    WHERE LEFT(contenido, 1) = '0';

    INSERT INTO liquidacion_cuerpo (
        id_liquidacion,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    )
    SELECT
        le.id_liquidacion_ultima,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    FROM generarArchivoDebito(1, 3, idestablecimiento) g
    INNER JOIN (
        SELECT MAX(id_liquidacion) AS id_liquidacion_ultima
        FROM Liquidacion_encabezado
    ) le ON 1 = 1
    WHERE LEFT(contenido, 1) = '1';

    ------------------------------------------------------------------
    -- LIQUIDACIÓN VISA CRÉDITO
    ------------------------------------------------------------------

    INSERT INTO Liquidacion_encabezado (
        marca_tipo_tarjeta,
        fecha_presentacion_txt,
        hora_armado_txt
    )
    SELECT
        1 AS marca_tipo_tarjeta,
        fecha_presentacion,
        hora_presentacion
    FROM generarArchivoDebito(1, 4, idestablecimiento)
    WHERE LEFT(contenido, 1) = '0';

    INSERT INTO liquidacion_cuerpo (
        id_liquidacion,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    )
    SELECT
        le.id_liquidacion_ultima,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    FROM generarArchivoDebito(1, 4, idestablecimiento) g
    INNER JOIN (
        SELECT MAX(id_liquidacion) AS id_liquidacion_ultima
        FROM Liquidacion_encabezado
    ) le ON 1 = 1
    WHERE LEFT(contenido, 1) = '1';

    ------------------------------------------------------------------
    -- LIQUIDACIÓN MASTERCARD CRÉDITO
    ------------------------------------------------------------------

    INSERT INTO Liquidacion_encabezado (
        marca_tipo_tarjeta,
        fecha_presentacion_txt,
        hora_armado_txt
    )
    SELECT
        2 AS marca_tipo_tarjeta,
        fecha_presentacion,
        hora_presentacion
    FROM generarArchivoDebito(2, 4, idestablecimiento)
    WHERE LEFT(contenido, 1) = '0';

    INSERT INTO liquidacion_cuerpo (
        id_liquidacion,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    )
    SELECT
        le.id_liquidacion_ultima,
        id_alumno_cc,
        numero_tarjeta,
        numero_factura,
        codigo_transaccion,
        importe,
        codigo_alta
    FROM generarArchivoDebito(2, 4, idestablecimiento) g
    INNER JOIN (
        SELECT MAX(id_liquidacion) AS id_liquidacion_ultima
        FROM Liquidacion_encabezado
    ) le ON 1 = 1
    WHERE LEFT(contenido, 1) = '1';

    ------------------------------------------------------------------
    -- DEVOLVER LOS 3 ARCHIVOS COMO BYTEA
    ------------------------------------------------------------------

    archivo_visa_debito :=
        convert_to(contenido_visa_debito, 'UTF8');

    archivo_visa_credito :=
        convert_to(contenido_visa_credito, 'UTF8');

    archivo_mastercard_credito :=
        convert_to(contenido_mastercard_credito, 'UTF8');

    RETURN NEXT;

END;
$BODY$;

