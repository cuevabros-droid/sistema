import { ContainerPg } from '../../daos/container/containerPg.js';

const pg = new ContainerPg();

class ReportesService {
  async ejecutarReporte(tipoReporte, parametros) {
    return await pg.ejecutarReporte(tipoReporte, parametros);
  }
}

export default new ReportesService();

