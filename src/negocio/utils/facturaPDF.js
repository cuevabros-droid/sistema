import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

const formatMoneda = (val) => {
  const num = Number(val) || 0;
  return num.toLocaleString('es-AR', {
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
  borderBox: { border: '1px solid #000', marginBottom: 5, padding: 5 },
  headerContainer: { flexDirection: 'row', border: '1px solid #000', marginBottom: 5, minHeight: 110 },
  headerLeft: { width: '46%', padding: 8, flexDirection: 'row' },
  logoStyle: { width: 65, height: 65, marginRight: 8 },
  headerLeftText: { flex: 1 },
  headerCenter: { width: '8%', borderLeft: '1px solid #000', borderRight: '1px solid #000', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 5 },
  headerRight: { width: '46%', padding: 8 },
  typeLetter: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  typeCode: { fontSize: 7, textAlign: 'center' },
  title: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 8, marginBottom: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  
  // Estructura principal de la tabla
  tableContainer: { 
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #000',
    marginBottom: 5
  },
  
  // Encabezado de la tabla
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#eee', 
    fontWeight: 'bold', 
    borderBottomWidth: 1, 
    borderBottomColor: '#000', 
    height: 20, 
    alignItems: 'center' 
  },
  
  // Área principal de columnas dinámicas que llena el espacio
  tableColumnsContainer: {
    flex: 1,
    flexDirection: 'row'
  },

  // Columnas verticales continuas de arriba a abajo
  colCodeContainer: { 
    width: '15%', 
    borderRightWidth: 1, 
    borderRightColor: '#000' 
  },
  colDescContainer: { 
    width: '65%', 
    borderRightWidth: 1, 
    borderRightColor: '#000' 
  },
  colTotalContainer: { 
    width: '20%' 
  },

  // Celdas individuales dentro de cada columna
  headerCell: {
    height: '100%',
    justify: 'center',
    alignItems: 'center',
    fontWeight: 'bold'
  },
  cellItem: {
    height: 20,
    justify: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingLeft: 4,
    paddingRight: 4
  },

  // Filas del pie de tabla
  sonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    padding: 4,
    minHeight: 18,
    alignItems: 'center'
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    minHeight: 22,
    alignItems: 'center'
  },
  colTotalLabel: {
    width: '80%',
    fontWeight: 'bold',
    fontSize: 10,
    paddingLeft: 4,
    borderRightWidth: 1,
    borderRightColor: '#000',
    height: '100%',
    justify: 'center'
  },
  colTotalValue: {
    width: '20%',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'right',
    paddingRight: 4,
    height: '100%',
    justify: 'center'
  },

  // Pie ARCA / AFIP
  footerBox: {
    border: '1px solid #000',
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between'
  },
  qrCode: { width: 75, height: 75 },
  footerCenter: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10
  },
  arcaHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4
  },
  arcaTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 4
  },
  arcaSubtitle: {
    fontSize: 6,
    color: '#333'
  },
  legalText: {
    fontSize: 6,
    color: '#444',
    marginTop: 4
  },
  caeBox: {
    textAlign: 'right',
    justify: 'center'
  },
  pageNumber: {
    fontSize: 7,
    textAlign: 'right',
    marginBottom: 6
  },
  bold: { fontWeight: 'bold' }
});

export const FacturaPDF = ({ data }) => {
  if (!data) return null;

  const { emisor, periodo, receptor, items, totales, afip } = data;

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      
      // 1. Periodo Facturado
      React.createElement(View, { style: styles.borderBox },
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

      // 2. Cabecera Emisor
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

      // 3. Receptor
      React.createElement(View, { style: styles.borderBox },
        React.createElement(View, { style: styles.row },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Señores: "), receptor?.razonSocial),
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "DNI/CUIT: "), receptor?.cuil)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Domicilio: "), receptor?.domicilio || ''),
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Condición frente al IVA: "), receptor?.condicionIva)
        ),
        React.createElement(View, { style: styles.row },
          React.createElement(Text, null, React.createElement(Text, { style: styles.bold }, "Condición de venta: "), receptor?.condicionVenta)
        )
      ),

      // 4. Tabla de items con columnas verticales extendidas
      React.createElement(View, { style: styles.tableContainer },
        
        // Encabezado
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(View, { style: [styles.colCodeContainer, styles.headerCell] }, React.createElement(Text, null, "Código")),
          React.createElement(View, { style: [styles.colDescContainer, styles.headerCell] }, React.createElement(Text, null, "Descripción")),
          React.createElement(View, { style: [styles.colTotalContainer, styles.headerCell] }, React.createElement(Text, null, "Total"))
        ),
        
        // Cuerpo: Las 3 columnas ocupan todo el alto libre mediante flex: 1
        React.createElement(View, { style: styles.tableColumnsContainer },
          
          // Columna 1: Código
          React.createElement(View, { style: styles.colCodeContainer },
            (items || []).map((item, index) =>
              React.createElement(View, { style: [styles.cellItem, { alignItems: 'center' }], key: index },
                React.createElement(Text, null, item.codigo || '1')
              )
            )
          ),

          // Columna 2: Descripción
          React.createElement(View, { style: styles.colDescContainer },
            (items || []).map((item, index) =>
              React.createElement(View, { style: styles.cellItem, key: index },
                React.createElement(Text, null, item.descripcion)
              )
            )
          ),

          // Columna 3: Total
          React.createElement(View, { style: styles.colTotalContainer },
            (items || []).map((item, index) =>
              React.createElement(View, { style: [styles.cellItem, { alignItems: 'flex-end' }], key: index },
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
          React.createElement(View, { style: styles.colTotalLabel }, React.createElement(Text, null, "TOTAL")),
          React.createElement(View, { style: styles.colTotalValue }, React.createElement(Text, null, formatMoneda(totales?.total)))
        )
      ),

      // 5. Pie Oficial ARCA / AFIP
      React.createElement(View, { style: styles.footerBox },
        //afip?.qrUrl ? React.createElement(Image, { src: afip.qrUrl, style: styles.qrCode }) : React.createElement(View, { style: styles.qrCode }),
// 1. Imagen del Código QR con hipervínculo
// 1. Contenedor del Código QR con enlace superpuesto
data.afip?.qrDataUrl ? (
  React.createElement(View, { style: { position: 'relative', width: 60, height: 60, marginRight: 6 } },
    // A) Imagen visible del QR
    React.createElement(Image, { 
      src: data.afip.qrDataUrl, 
      style: { width: 60, height: 60 } 
    }),
    // B) Capa transparente del Link por encima para registrar el clic
    data.afip?.qrUrl ? (
      React.createElement(Link, { 
        src: data.afip.qrUrl, 
        style: { 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: 60, 
          height: 60 
        } 
      })
    ) : null
  )
) : null,

        React.createElement(View, { style: styles.footerCenter },
          React.createElement(View, { style: styles.arcaHeader },
            React.createElement(Text, { style: styles.arcaTitle }, "ARCA"),
            React.createElement(Text, { style: styles.arcaSubtitle }, "AGENCIA DE RECAUDACIÓN Y CONTROL ADUANERO")
          ),
          React.createElement(Text, { style: [styles.bold, { fontSize: 8 }] }, "Comprobante Autorizado"),
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