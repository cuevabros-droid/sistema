// backend/src/negocio/utils/excel.js
import ExcelJS from 'exceljs';

export async function exportToExcelCustom({ columnsConfig, data, fileName, sheetName, res }) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName || 'Hoja1');

  worksheet.columns = columnsConfig;

  // Asegurarnos de que 'data' sea un arreglo
  const rows = Array.isArray(data) ? data : [data];
  worksheet.addRows(rows);

  // 1. 🎨 ESTILO PARA EL ENCABEZADO (Fila 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 24; // Le damos un poco más de alto a la cabecera
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '000000' } // Negro puro
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // 2. 🔲 ESTILO PARA LOS BORDES
  const borderStyle = {
    top: { style: 'thin', color: { argb: 'CCCCCC' } },
    left: { style: 'thin', color: { argb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
    right: { style: 'thin', color: { argb: 'CCCCCC' } }
  };

  // 3. RECORRER Y APLICAR BORDES A TODAS LAS CELDAS
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = borderStyle;

      // Estilo por defecto para los datos (filas de la 2 en adelante)
      if (rowNumber > 1) {
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle' };
      }
    });
  });

  // Configurar las cabeceras de la respuesta
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);

  // Escribir y finalizar
  await workbook.xlsx.write(res);
  res.end();
}