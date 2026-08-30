import { parametros } from "../repository/parametros/parametros.js";

class ParametrosService {

  async parametros(id) {
    const lista = await parametros(id);
    return lista;
  }


}

export const parametrosService = new ParametrosService();
