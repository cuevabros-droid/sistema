import express from 'express';
import routerLogin from './routers/routerLogin.js'
import routerApiUser from './routers/routerApiUser.js'
import routerApiProducts from './routers/routerApiProducts.js'
import routerApiShoppingCart from './routers/routerApiShoppingCart.js'
import routerImage from './routers/routerImage.js'
import routerApiOrders from './routers/routerApiOrders.js'
import routerApiPersons from './routers/routerApiPersons.js'
import routerApiHorario from './routers/routerApiHorario.js'
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


//Middlewares para los routers
servidor.use('/', routerLogin)
servidor.use('/', routerApiUser)
servidor.use('/api/products', routerApiProducts)
servidor.use('/api/shoppingcartproducts', routerApiShoppingCart)
servidor.use('/api/images', routerImage)
servidor.use('/api/orders', routerApiOrders)
servidor.use('/api/persons', routerApiPersons)
servidor.use('/api/personsconfiltro', routerApiPersons)
servidor.use('/api/horario', routerApiHorario)
servidor.use('/api/horarioconfiltro', routerApiHorario)
servidor.use('/api/horarioconid', routerApiHorario)
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















