import Express from 'express';
import { Arca } from '@arcasdk/core';
import fs from 'fs';
import path from 'path';

const router = Express.Router();

// Carga de certificados de Producción
const certPath = path.resolve('src/afip_certs/certificado.crt');
const keyPath = path.resolve('src/afip_certs/clave.key');

const arca = new Arca({
  cuit: 30670917688,
  cert: fs.readFileSync(certPath, 'utf8'),
  key: fs.readFileSync(keyPath, 'utf8'),
  production: true
});

router.get('/consultar-factura-directa', async (req, res) => {
  try {
    const { ptoVta, tipoCmp, nroCmp } = req.query;

    const pVta = Number(ptoVta);
    const tCmp = Number(tipoCmp);
    const nCmp = Number(nroCmp);

    // Consulta enviando los parámetros posicionales requeridos por la SDK: (nroCmp, ptoVta, tipoCmp)
    const voucherInfo = await arca.electronicBillingService.getVoucherInfo(nCmp, pVta, tCmp);

    if (!voucherInfo) {
      return res.status(404).json({ error: "No se encontró el comprobante en AFIP Producción." });
    }

    // Mapeo exacto de la respuesta oficial de AFIP
    return res.json({
      cae: String(voucherInfo.codAutorizacion || voucherInfo.CodAutorizacion),
      fchVto: String(voucherInfo.fchVto || voucherInfo.FchVto),
      fechaEmision: String(voucherInfo.cbteFch || voucherInfo.CbteFch),
      importeTotal: Number(voucherInfo.impTotal || voucherInfo.ImpTotal),
      docNro: voucherInfo.docNro,
      docTipo: Number(voucherInfo.docTipo || voucherInfo.DocTipo) // <--- Agregamos este campo
    });

  } catch (error) {
    console.error("Error al consultar comprobante en AFIP:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;