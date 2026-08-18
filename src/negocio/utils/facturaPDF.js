import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const formatMoneda = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const styles = StyleSheet.create({
  page: { 
    padding: 20, 
    fontSize: 8, 
    fontFamily: 'Helvetica', 
    color: '#000',
    display: 'flex',
    flexDirection: 'column'
  },
  // Bloque datos cliente (marco exterior firme 1.2pt)
  borderBox: { 
    borderWidth: 1.2, 
    borderColor: '#000', 
    marginBottom: 5, 
    padding: 5 
  },
  // Encabezado emisor (marco exterior firme 1.2pt)
  headerContainer: { 
    flexDirection: 'row', 
    borderWidth: 1.2, 
    borderColor: '#000', 
    marginBottom: 5, 
    minHeight: 110 
  },
  headerLeft: { 
    width: '46%', 
    padding: 8, 
    flexDirection: 'row',
    alignItems: 'center' 
  },
  logoStyle: { width: 65, height: 65, marginRight: 8 },
  headerLeftText: { flex: 1 },
  headerCenter: { 
    width: '8%', 
    borderLeftWidth: 0.5,
    borderRightWidth: 0.7,
    borderColor: '#000', 
    alignItems: 'center', 
    justifyContent: 'flex-start', 
    paddingTop: 5 
  },
  headerRight: { width: '46%', padding: 8 },
  typeLetter: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  typeCode: { fontSize: 7, textAlign: 'center' },
  title: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 8, marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  // TABLA: Marco exterior firme (1.2pt)
  unifiedTableContainer: { 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1.2,
    borderColor: '#000',
    marginBottom: 5
  },

  // Período Facturado: borde inferior ancho (1.2pt)
  periodHeaderRow: {
    padding: 5,
    borderBottomWidth: 0.8, // <--- Borde ancho inferior
    //borderTopWidth: 0.1,    // <--- AGREGA ESTA LÍNEA (Ajusta el grosor aquí, ej: 1.2 o 1.5)
    borderBottomColor: '#000',
    backgroundColor: '#F2F2F2'
  },

  // ENCABEZADO DE TABLA (Código / Descripción / Total): borde inferior ancho (1.2pt)
  tableHeaderRow: {
    flexDirection: 'row',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderBottomWidth: 0.6, // <--- Borde ancho inferior debajo de los títulos
    borderBottomColor: '#000'
  },
  headerCellCode: {
    width: '15%',
    borderRightWidth: 0.4,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCellDesc: {
    width: '65%',
    borderRightWidth: 0.4,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCellTotal: {
    width: '20%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  columnHeaderText: {
    fontWeight: 'bold',
    fontSize: 8
  },

  // CUERPO DE LA TABLA
  tableColumnsRow: {
    flex: 1,
    flexDirection: 'row'
  },
  colCodeBlock: {
    width: '15%',
    borderRightWidth: 0.4,
    borderRightColor: '#000',
    display: 'flex',
    flexDirection: 'column'
  },
  colDescBlock: {
    width: '65%',
    borderRightWidth: 0.4,
    borderRightColor: '#000',
    display: 'flex',
    flexDirection: 'column'
  },
  colTotalBlock: {
    width: '20%',
    display: 'flex',
    flexDirection: 'column'
  },

  // Renglones de los ítems
  cellContent: {
    height: 24,
    paddingTop: 6,
    paddingLeft: 6,
    paddingRight: 6,
    borderBottomWidth: 0.3,
    borderBottomColor: '#D0D0D0'
  },

  // Filas del pie
  sonRow: {
    flexDirection: 'row',
    borderTopWidth: 1.0, // <--- Borde ancho para separar del cuerpo de la tabla
    borderTopColor: '#000',
    paddingLeft: 6,
    paddingRight: 6,
    height: 22,
    alignItems: 'center'
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#000',
    height: 22,
    alignItems: 'center'
  },
  colTotalLabel: {
    width: '80%',
    fontWeight: 'bold',
    fontSize: 9,
    paddingLeft: 6,
    borderRightWidth: 0.5,
    borderRightColor: '#000',
    height: '100%',
    justifyContent: 'center'
  },
  colTotalValue: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 9,
    paddingRight: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },

  // Pie ARCA / AFIP
  footerBox: {
    borderWidth: 1.2,
    borderColor: '#000',
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footerCenter: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  arcaHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 3
  },
  legalText: {
    fontSize: 5.5,
    color: '#444',
    marginTop: 3
  },
  caeBox: {
    textAlign: 'right',
    justifyContent: 'center'
  },
  pageNumber: {
    fontSize: 7,
    textAlign: 'right',
    marginBottom: 4
  },
  bold: { fontWeight: 'bold' }
});


export const FacturaPDF = ({ data }) => {
  if (!data) return null;

  const { emisor, periodo, receptor, items, totales, afip } = data;
  const nombreArchivo = `Factura_${emisor?.puntoVenta || '0003'}-${emisor?.numeroComprobante || '0001'}`;

  return React.createElement(Document, { title: nombreArchivo },
    React.createElement(Page, { size: "A4", style: styles.page },
      
      // 1. Cabecera Emisor
      React.createElement(View, { style: styles.headerContainer },
        React.createElement(View, { style: styles.headerLeft },
          emisor?.logoUrl ? React.createElement(Image, { src: emisor.logoUrl, style: styles.logoStyle }) : null,
          React.createElement(View, { style: styles.headerLeftText },
            React.createElement(Text, { style: styles.title }, emisor?.razonSocial),
            React.createElement(Text, { style: styles.subtitle }, emisor?.domicilio),
            React.createElement(Text, { style: styles.subtitle }, emisor?.localidad_provincia),
            React.createElement(Text, { style: styles.subtitle },
              React.createElement(Text, { style: styles.bold }, "IVA: "),
              emisor?.condicionIva
            )
          )
        ),
        React.createElement(View, { style: styles.headerCenter },
          React.createElement(Text, { style: styles.typeLetter }, emisor?.tipoComprobante || 'C'),
          React.createElement(Text, { style: styles.typeCode }, `Código\n${emisor?.codigoComprobante || '11'}`)
        ),
        React.createElement(View, { style: styles.headerRight },
          React.createElement(Text, { style: styles.title }, "Factura"),
          React.createElement(Text, { style: styles.subtitle },
            React.createElement(Text, { style: styles.bold }, "N° "),
            `${emisor?.puntoVenta || '0003'}-${emisor?.numeroComprobante || ''}`
          ),
          React.createElement(Text, { style: styles.subtitle },
            React.createElement(Text, { style: styles.bold }, "Fecha: "),
            emisor?.fechaEmision
          ),
          React.createElement(Text, { style: styles.subtitle },
            React.createElement(Text, { style: styles.bold }, "CUIT: "),
            emisor?.cuit
          ),
          React.createElement(Text, { style: styles.subtitle },
            React.createElement(Text, { style: styles.bold }, "ING. BRUTOS: "),
            emisor?.ingresosBrutos
          ),
          React.createElement(Text, { style: styles.subtitle },
            React.createElement(Text, { style: styles.bold }, "Inicio de actividades: "),
            emisor?.inicioActividades
          )
        )
      ),

      // 2. Receptor
      React.createElement(View, { style: styles.borderBox },
        React.createElement(View, { style: styles.row },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Señores: "), receptor?.razonSocial),
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "DNI/CUIT: "), receptor?.cuil)
        ),
        React.createElement(View, { style: [styles.row, { marginTop: 3 }] },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Domicilio: "), receptor?.domicilio || ''),
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Condición frente al IVA: "), receptor?.condicionIva)
        ),
        React.createElement(View, { style: [styles.row, { marginTop: 3 }] },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Condición de venta: "), receptor?.condicionVenta)
        )
      ),

      // 3. Bloque Unificado: Período Facturado + Tabla de Ítems
      React.createElement(View, { style: styles.unifiedTableContainer },
        
        // Período Facturado
        React.createElement(View, { style: styles.periodHeaderRow },
          React.createElement(View, { style: styles.row },
            React.createElement(Text, null,
              React.createElement(Text, { style: styles.bold }, "Período facturado: "),
              `${periodo?.desde || ''} al ${periodo?.hasta || ''}`
            ),
            React.createElement(Text, null,
              React.createElement(Text, { style: styles.bold }, "Concepto: "),
              periodo?.concepto || 'Cuota'
            )
          )
        ),

        // Fila de Encabezados (Título)
        React.createElement(View, { style: styles.tableHeaderRow },
          React.createElement(View, { style: styles.headerCellCode },
            React.createElement(Text, { style: styles.columnHeaderText }, "Código")
          ),
          React.createElement(View, { style: styles.headerCellDesc },
            React.createElement(Text, { style: styles.columnHeaderText }, "Descripción")
          ),
          React.createElement(View, { style: styles.headerCellTotal },
            React.createElement(Text, { style: styles.columnHeaderText }, "Total")
          )
        ),

        // Columnas del Cuerpo (Datos)
        React.createElement(View, { style: styles.tableColumnsRow },
          
          // CÓDIGO
          React.createElement(View, { style: styles.colCodeBlock },
            (items || []).map((item, index) =>
              React.createElement(View, { style: [styles.cellContent, { alignItems: 'center' }], key: index },
                React.createElement(Text, null, item.codigo || '1')
              )
            )
          ),

          // DESCRIPCIÓN
          React.createElement(View, { style: styles.colDescBlock },
            (items || []).map((item, index) =>
              React.createElement(View, { style: styles.cellContent, key: index },
                React.createElement(Text, null, item.descripcion)
              )
            )
          ),

          // TOTAL
          React.createElement(View, { style: styles.colTotalBlock },
            (items || []).map((item, index) =>
              React.createElement(View, { style: [styles.cellContent, { alignItems: 'flex-end' }], key: index },
                React.createElement(Text, null, formatMoneda(item.importe))
              )
            )
          )

        ),

        // Texto "Son: ..."
        React.createElement(View, { style: styles.sonRow },
          React.createElement(Text, null,
            React.createElement(Text, { style: styles.bold }, "Son: "),
            `${totales?.textoImporte || ''} con vencimiento el ${periodo?.vencimientoPago || ''}`
          )
        ),

        // Total
        React.createElement(View, { style: styles.totalRow },
          React.createElement(View, { style: styles.colTotalLabel }, 
            React.createElement(Text, null, "TOTAL")
          ),
          React.createElement(View, { style: styles.colTotalValue }, 
            React.createElement(Text, null, formatMoneda(totales?.total))
          )
        )
      ),

      // 4. Pie Oficial ARCA / AFIP
      React.createElement(View, { style: styles.footerBox },
        
        afip?.qrDataUrl ? (
          afip?.qrUrl ? (
            React.createElement(Link, {
              src: afip.qrUrl,
              style: { width: 75, height: 75, marginRight: 6 }
            },
              React.createElement(Image, {
                src: afip.qrDataUrl,
                style: { width: 75, height: 75 }
              })
            )
          ) : (
            React.createElement(Image, {
              src: afip.qrDataUrl,
              style: { width: 65, height: 65, marginRight: 6 }
            })
          )
        ) : null,

        React.createElement(View, { style: styles.footerCenter },
          React.createElement(View, { style: styles.arcaHeader },
            React.createElement(Text, { style: { fontSize: 11, fontWeight: 'bold', marginRight: 4 } }, "ARCA"),
            React.createElement(Text, { style: { fontSize: 6, color: '#333' } }, "AGENCIA DE RECAUDACIÓN Y CONTROL ADUANERO")
          ),
          React.createElement(Text, { style: [styles.bold, { fontSize: 8 }] }, "Comprobante Autorizado"),
          
          afip?.qrUrl ? (
            React.createElement(Link, {
              src: afip.qrUrl,
              style: { fontSize: 6.5, color: '#0055BB', textDecoration: 'underline', marginTop: 2, marginBottom: 2 }
            },
              React.createElement(Text, null, "Ver comprobante en AFIP / ARCA")
            )
          ) : null,

          React.createElement(Text, { style: styles.legalText }, "Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación")
        ),

        React.createElement(View, { style: styles.caeBox },
          React.createElement(Text, { style: styles.pageNumber }, "Página 1/1"),
          React.createElement(Text, { style: styles.bold }, `CAE N°: ${afip?.cae || ''}`),
          React.createElement(Text, { style: styles.bold }, `FECHA DE VTO: ${afip?.vencimientoCae || ''}`)
        )
      )

    )
  );
};