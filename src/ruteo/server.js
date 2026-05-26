import express from 'express';
import routerLogin from './routers/routerLogin.js'
import routerApiUser from './routers/routerApiUser.js'
import routerImage from './routers/routerImage.js'
import routerApiPersons from './routers/routerApiPersons.js'
import routerApiLocalidades from './routers/routerApiLocalidades.js';
import routerApiNacionalidades from './routers/routerApiNacionalidades.js';
import {PUERTO_POR_DEFECTO} from '../config/config.js'
import parseArgs from 'yargs/yargs'
import { multer_function } from '../negocio/utils/multer.js'
import cors from 'cors'


const servidor = express()

//Cors
servidor.use(cors());

//Middlewares para resolver los datos que viene por el Post
//Si viene por un Json o si viene de un formulario (Form)
servidor.use(express.json())
servidor.use(express.urlencoded({ extended: true }))
//console.log(routerLogin)

//Middlewares para los routers
servidor.use('/', routerLogin)
servidor.use('/api/localidades', routerApiLocalidades)
servidor.use('/api/nacionalidades', routerApiNacionalidades)
servidor.use('/api/images', routerImage)
servidor.use('/api/persons', routerApiPersons)
servidor.use('/api', routerApiPersons)
servidor.use('/api/personsconfiltro', routerApiPersons)
servidor.use(express.static('public/img'))

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















