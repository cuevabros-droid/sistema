import express from 'express';
import routerLogin from './routers/routerLogin.js'
import routerApiUser from './routers/routerApiUser.js'
import routerImage from './routers/routerImage.js'
import routerApiPersons from './routers/routerApiPersons.js'
import routerApiAlumnos from './routers/routerApiAlumnos.js'
import routerApiLocalidades from './routers/routerApiLocalidades.js';
import routerApiNacionalidades from './routers/routerApiNacionalidades.js';
import routerApiDocumentos from './routers/routerApiDocumentos.js';
import routerApiDesercion from './routers/routerApiDesercion.js';
import routerApiOcupacion from './routers/routerApiOcupacion.js';
import routerApiEstudio from './routers/routerApiEstudio.js';
import routerApiTipoAllegado from './routers/routerApiTipoAllegado.js';
import routerApiAcademica from './routers/routerApiAcademica.js';
import routerApiPagos from './routers/routerApiPagos.js';
import routerApiMarcadores from './routers/routerApiMarcadores.js';
import routerApiArchivosAfectacion  from './routers/routerApiArchivosAfectacion.js';
import {PUERTO_POR_DEFECTO} from '../config/config.js'
import parseArgs from 'yargs/yargs'
import { multer_function } from '../negocio/utils/multer.js'
import archivoDebitoRoutes from "./routers/routerApiArchivosAfectacion.js";
import cors from 'cors'


const servidor = express()

//Cors
servidor.use(cors({
  origin: '*', // O la URL de tu frontend React
  exposedHeaders: ['Content-Disposition'] // 👈 CLAVE: Permite que el navegador reconozca el adjunto
}));


//servidor.use(cors());

// Configuración de CORS
/*servidor.use(cors({
  origin: 'http://localhost:3000', // Tu puerto de React
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // 👈 ¡CLAVE! Permite al navegador leer el archivo adjunto
}));*/

//Middlewares para resolver los datos que viene por el Post
//Si viene por un Json o si viene de un formulario (Form)
/*servidor.use(express.json())
servidor.use(express.urlencoded({ extended: true }))*/
// Línea 36: Aumentamos el límite de tamaño permitido
servidor.use(express.json({ limit: '50mb' }));
servidor.use(express.urlencoded({ limit: '50mb', extended: true }));
//console.log(routerLogin)

//Middlewares para los routers
servidor.use('/', routerLogin)
servidor.use('/api/localidades', routerApiLocalidades)
servidor.use('/api/nacionalidades', routerApiNacionalidades)
servidor.use('/api/documentos', routerApiDocumentos)
servidor.use('/api/desercion', routerApiDesercion)
servidor.use('/api/ocupacion', routerApiOcupacion)
servidor.use('/api/estudio', routerApiEstudio)
servidor.use('/api/tipoallegado', routerApiTipoAllegado)
servidor.use('/api/images', routerImage)
servidor.use('/api/persons', routerApiPersons)
servidor.use('/api/personsconfiltro', routerApiPersons)
servidor.use('/api/alumnos', routerApiAlumnos)
servidor.use('/api/academica', routerApiAcademica)
servidor.use('/api/pagos', routerApiPagos)
servidor.use('/api/marcadores', routerApiMarcadores)
servidor.use(express.static('public/img'))
servidor.use("/api/archivos-debito", archivoDebitoRoutes);

//multer
multer_function()

//Si viene de una ruta no implementada
servidor.all('*', (req, res) => {
  res.status(404).json({error: "404", descripcion: "ruta " + req.url + " método " + req.method + " no implementado"})
})


const yargs = parseArgs(process.argv.slice(2))

const argv = yargs.alias({p: 'port'}).default({port: PUERTO_POR_DEFECTO}).argv

const puerto = argv.port



function conectar() {
  return new Promise((resolve, reject) => {
    const servidorConectado = servidor.listen(puerto, () => {
      resolve(servidorConectado)
    })
  })
}



export default conectar















