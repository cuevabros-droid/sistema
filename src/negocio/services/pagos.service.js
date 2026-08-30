import { listarMarcas } from "../repository/pagos/pagos.js";
import { listarMedios } from "../repository/pagos/pagos.js";
import { listarEntidades } from "../repository/pagos/pagos.js";
import { listado } from "../repository/pagos/pagos.js";
import { createPago } from "../repository/pagos/pagos.js";
import { updatePago } from "../repository/pagos/pagos.js";
import { deletePago } from "../repository/pagos/pagos.js";
import { createPagoCuota } from "../repository/pagos/pagos.js";
import { generarArchivoDebito } from "../repository/pagos/pagos.js";

class PagosService {
  async listarMedios() {
    const lista = await listarMedios();
    return lista;
  }

  async listarMarcas() {
    const lista = await listarMarcas();
    return lista;
  }

  async listarEntidades() {
    const lista = await listarEntidades();
    return lista;
  }

  async listado(id, id_establecimiento) {
    const lista = await listado(id, id_establecimiento);
    return lista;
  }

  async updatePago(objeto) {
    try {
      resul = await updatePago(objeto);
      return resul;
    } catch (error) {
      return error;
    }
  }

  async createPago(objeto) {
    try {
      const resul = await createPago(objeto);
      return resul;
    } catch (error) {
      return error;
    }
  }

  async deletePago(objeto) {
    try {
      const resul = await deletePago(objeto);
      return resul;
    } catch (error) {
      return error;
    }
  }

  async generarArchivoDebito() {
    try {
      const resul = await generarArchivoDebito();
      return resul;
    } catch (error) {
      return error;
    }
  }


  async createPagoCuota(objeto) {
    try {
      const resul = await createPagoCuota(objeto);
      return resul;
    } catch (error) {
      return error;
    }
  }

}

export const pagosService = new PagosService();
