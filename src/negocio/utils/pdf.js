import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  title: { fontSize: 18, marginBottom: 4, color: '#0f172a', fontWeight: 'bold' },
  subtitle: { fontSize: 9, marginBottom: 15, color: '#64748b' },
  table: { display: 'table', width: '100%', borderWidth: 1, borderColor: '#e2e8f0' },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#1e293b' },
  tableCell: { padding: 6, fontSize: 8, borderRightWidth: 1, borderRightColor: '#e2e8f0' },
});

export const GenericPDFReport = ({ title = 'Reporte', columns = [], data = [] }) => {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      
      // Título
      React.createElement(Text, { style: styles.title }, title),
      
      // Subtítulo
      React.createElement(
        Text,
        { style: styles.subtitle },
        `Generado el: ${new Date().toLocaleDateString()}`
      ),

      // Tabla
      React.createElement(
        View,
        { style: styles.table },

        // Encabezado
        React.createElement(
          View,
          { style: [styles.tableRow, styles.tableHeader] },
          columns.map((col, idx) =>
            React.createElement(
              Text,
              {
                key: idx,
                style: [
                  styles.tableCell,
                  { width: col.width || '25%', color: '#ffffff', fontWeight: 'bold' }
                ]
              },
              col.header
            )
          )
        ),

        // Filas de datos
        data.map((row, rIdx) =>
          React.createElement(
            View,
            {
              key: rIdx,
              style: [
                styles.tableRow,
                { backgroundColor: rIdx % 2 === 0 ? '#f8fafc' : '#ffffff' }
              ]
            },
            columns.map((col, cIdx) =>
              React.createElement(
                Text,
                {
                  key: cIdx,
                  style: [styles.tableCell, { width: col.width || '25%' }]
                },
                row[col.key] ?? ''
              )
            )
          )
        )
      )
    )
  );
};