// src/negocio/utils/afip.js
import path from 'path';
import fs from 'fs';
import { Arca } from '@arcasdk/core';

const esProduccion = process.env.ENVIRONMENT === 'produccion';
const certFolder = esProduccion ? 'afip_certs' : 'afip_certs_homologacion';

const certPath = path.resolve(`src/${certFolder}/certificado.crt`);
const keyPath = path.resolve(`src/${certFolder}/clave.key`);

const cert = fs.readFileSync(certPath, 'utf8');
const key = fs.readFileSync(keyPath, 'utf8');

const cuit = Number(esProduccion ? process.env.AFIP_CUIT_PROD : process.env.AFIP_CUIT_TEST);

const arca = new Arca({
  cuit,
  cert,
  key,
  production: esProduccion,
  useHttpsAgent: esProduccion
});

export async function emitirFacturaAFIP(datosFactura) {
  const tipoComprobante = Number(datosFactura.tipoComprobante || 11);
  const esFacturaC = [11, 12, 13].includes(tipoComprobante);

  const impTotal = Number(datosFactura.impTotal || 0);
  const impNeto = esFacturaC ? impTotal : Number(datosFactura.impNeto || impTotal);
  const impIva = esFacturaC ? 0 : Number(datosFactura.impIva || 0);

  const condicionIva = Number(
    datosFactura.condicionIvaReceptorId || 
    datosFactura.condicionIvaReceptor || 
    datosFactura.CondicionIVAReceptorId || 
    5
  );

  const payloadAFIP = {
    CantReg: 1,
    PtoVta: Number(datosFactura.puntoVenta || 1),
    CbteTipo: tipoComprobante,
    Concepto: Number(datosFactura.concepto || 1),
    DocTipo: Number(datosFactura.docTipo || 99),
    DocNro: Number(datosFactura.docNro || 0),
    CbteFch: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    ImpTotal: impTotal,
    ImpTotConc: 0,
    ImpNeto: impNeto,
    ImpOpEx: 0,
    ImpIVA: impIva,
    ImpTrib: 0,
    MonId: 'PES',
    MonCotiz: 1,
    CondicionIVAReceptorId: condicionIva
  };

  if (!esFacturaC) {
    payloadAFIP.Iva = datosFactura.iva || [
      {
        Id: 5,
        BaseImp: impNeto,
        Importe: impIva
      }
    ];
  }

  const respuesta = await arca.electronicBillingService.createNextVoucher(payloadAFIP);

  // Navegación segura por la respuesta de @arcasdk/core
  const feDet = 
    respuesta?.response?.FeDetResp?.FECAEDetResponse || 
    respuesta?.FeDetResp?.FECAEDetResponse || 
    respuesta?.response?.FECAEDetResponse || 
    respuesta?.FECAEDetResponse;

  const detalle = Array.isArray(feDet) ? feDet[0] : (feDet || respuesta);
  const cabecera = respuesta?.response?.FeCabResp || respuesta?.FeCabResp || respuesta;

  const resultado = detalle?.Resultado || cabecera?.Resultado || respuesta?.Resultado;

  if (resultado !== 'A') {
    const detalleError = detalle?.Observaciones 
      ? JSON.stringify(detalle.Observaciones) 
      : JSON.stringify(respuesta);
    throw new Error(`AFIP Rechazó el comprobante: ${detalleError}`);
  }

  // Extracción blindada contra variaciones de casing
  const numCbte = 
    detalle?.CbteDesde ?? 
    detalle?.cbteDesde ?? 
    detalle?.CbteHasta ?? 
    detalle?.cbteHasta ?? 
    respuesta?.CbteDesde ?? 
    respuesta?.cbteDesde ?? 
    null;

  const caeNum = 
    detalle?.CAE ?? 
    detalle?.cae ?? 
    respuesta?.cae ?? 
    respuesta?.CodAutorizacion ?? 
    null;

  const caeFchVto = 
    detalle?.CAEFchVto ?? 
    detalle?.caeFchVto ?? 
    respuesta?.caeFchVto ?? 
    respuesta?.FchVto ?? 
    null;

  return {
    cae: caeNum,
    vencimientoCae: caeFchVto,
    numeroComprobante: numCbte,
    nroComprobante: numCbte,
    puntoVenta: payloadAFIP.PtoVta
  };
}