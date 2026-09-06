import loggerError from '../../negocio/utils/pinoError.js';
import { pagosService } from '../../negocio/services/pagos.service.js';
import { emitirFacturaAFIP } from '../../negocio/utils/afip.js'; // Ajusta la ruta relativa según corresponda
import { ContainerPg } from '../../daos/container/containerPg.js';


async function controllerMedios({ user }, res) {
    try {
        const resul = await pagosService.listarMedios();
        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}


async function controllerMarcas({ user }, res) {
    try {
        const resul = await pagosService.listarMarcas();
        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}


async function controllerEntidades(req, res) {
    try {
        const resul = await pagosService.listarEntidades();
        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}

async function controllerCargos(req, res) {
    try {
        const resul = await pagosService.listarCargos();
        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}

async function controllerListado({ params: { id }, user }, res) {
    try {
        const resul = await pagosService.listado(
            id,
            user.identidadeducativa
        );

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}


async function controllerUpdate({ user, body }, res) {
    try {
        body.usuario_sistema = user.usuario;
        body.id_establecimiento = user.identidadeducativa;

        const resul = await pagosService.updatePago(body);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}


async function controllerCreate({ user, body }, res) {
    try {
        const resul = await pagosService.createPago(body);

        return res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        return res.status(404).json({
            error: error.message
        });
    }
}


async function controllerDelete(req, res) {
    const id = req.params.id;

    try {
        const resul = await pagosService.deletePago(id);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        res.status(404).json({
            error: error.message
        });
    }
}


async function controllerArchivoDebito(req, res) {
    const objeto = req.body;

    try {
        const resul = await pagosService.generarArchivoDebito(objeto);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        res.status(404).json({
            error: error.message
        });
    }
}


async function controllerCreatePago({ user, body }, res) {
    body.usuario = user.usuario;
//console.log(user.identidadeducativa)
    const containerPg = new ContainerPg();

    const parametros = await containerPg.parametros(user.identidadeducativa); // Nombre de tu parámetro

    // 2. Buscar el parámetro específico 'genera_comprobante_afip'
    const paramAFIP = parametros.find(
    p => p.parametro === 'genera_comprobante_afip' || p.nombre === 'genera_comprobante_afip'
    );

    // 3. Validar si está activo (contemplando 'SI', 'S' o true)
    const debeFacturar = paramAFIP?.valor?.toUpperCase() === 'SI' || paramAFIP?.valor === true;

    const tipo_comprobante_arca = parametros.find(
    p => p.parametro === 'tipo_comprobante_arca' 
    );


try {
    // 1. Mapeo explícito para solucionar la diferencia de nombres entre Frontend y Backend
    const puntoVenta = Number(body.punto_venta || body.puntoVenta || 1);
    const tipoComprobante = Number(body.comprobante_tipo || body.tipoComprobante);
    const docTipo = Number(body.docTipo || 99);
    const docNro = Number(body.nroDoc || body.docNro || 0);
    
    // Forzar el importe a un número positivo (AFIP no acepta montos negativos)
    const montoAbsoluto = Math.abs(Number(body.importe || body.impTotal || body.monto || 0));

    // Log para verificar en la consola del backend los datos que se enviarán
    //console.log("Datos procesados para AFIP:", { puntoVenta, tipoComprobante, docTipo, docNro, montoAbsoluto });

    let datosAfip = null;

    if (debeFacturar) {
    // 2. Invocación a AFIP/ARCA
      datosAfip = await emitirFacturaAFIP({
      puntoVenta,
      tipoComprobante,
      docTipo,
      docNro,
      impTotal: montoAbsoluto,
      impNeto: montoAbsoluto,
      impIva: 0,
      condicionIvaReceptorId: body.condicionIvaReceptorId || 5
    });

        // 3. Inyección de los datos devueltos por AFIP en el objeto 'body'
    body.cae = datosAfip?.cae;
    body.vencimientoCae = datosAfip?.vencimientoCae;
    body.comprobante_numero = datosAfip?.numeroComprobante; // <--- Factura AFIP a su campo correspondiente
    body.punto_venta = datosAfip?.puntoVenta;
    body.comprobante_tipo = tipo_comprobante_arca.valor;

    } else {
    body.cae = null;
    body.vencimientoCae = null;
    body.comprobante_numero = null; // <--- Factura AFIP a su campo correspondiente
    body.punto_venta = null;
    body.comprobante_tipo = null;
   }

        // 3. Guardado en base de datos con los datos completos
        const resul = await pagosService.createPagoCuota(body);

        return res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);

        return res.status(500).json({
            error: error.message
        });
    }
}


async function controllerGenerarPagos({ user, body }, res) {
  //const [envia_notif_al_generar_cargo, setValor_envia_notif_al_generar_cargo] = useState(null); EN BACKEND NOTIFICACIONES CORREO
  //const [envia_detalle_deuda_en_correo, setValor_envia_detalle_deuda_en_correo] = useState(null); EN BACKEND NOTIFICACIONES CORREO
  //const [envia_forma_pago_en_correo, setValor_envia_forma_pago_en_correo] = useState(null); EN BACKEND NOTIFICACIONES CORREO

    try {
        body.usuario_sistema = user.usuario;
        body.id_establecimiento = user.identidadeducativa;

        const resul = await pagosService.GenerarPagos(body);

        res.status(201).json(resul);
    } catch (error) {
        loggerError(error.message);
        res.status(404).json({ error: error.message });
    }
}



export {
    controllerMarcas,
    controllerMedios,
    controllerEntidades,
    controllerCargos,
    controllerListado,
    controllerUpdate,
    controllerCreate,
    controllerDelete,
    controllerArchivoDebito,
    controllerCreatePago,
    controllerGenerarPagos
};