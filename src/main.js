import conectar from './ruteo/server.js'
import {MODO_POR_DEFECTO} from './config/config.js'
import cluster from 'cluster' 
import os from 'os'
import parseArgs from 'yargs/yargs'
import loggerInfo from './negocio/utils/pinoInfo.js';
import loggerError from './negocio/utils/pinoError.js';



cluster.schedulingPolicy = cluster.SCHED_RR;

const numCPUs = os.cpus().length

const yargs = parseArgs(process.argv.slice(2))

const argv = yargs.alias({m: 'modo'}).default({modo: MODO_POR_DEFECTO}).argv

const MODO = argv.modo



async function main() {

if(MODO === 'cluster') { 
/* --------------------------------------------------------------------------- */
/* MASTER */
if (cluster.isPrimary) {
    loggerInfo("Cantidad de Procesadores: " + numCPUs)
    loggerInfo(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        loggerInfo('Worker', worker.process.pid, 'died', new Date().toLocaleString())
        cluster.fork()
    })
}
/* --------------------------------------------------------------------------- */
/* WORKERS */
else {
    try {
        const serv = await conectar();
        loggerInfo(`conectado al puerto ${serv.address().port}, proceso secundario: pid ${process.pid}`);
    } catch (error) {
        loggerError('algo falló: ' + error);
    }
 }
} else {
    try {
        const serv = await conectar();
        loggerInfo(`conectado al puerto ${serv.address().port}, proceso: pid ${process.pid}`);
    } catch (error) {
        loggerError('algo falló: ' + error);
    }
}
}

main()