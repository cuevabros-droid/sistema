import { mongoDatabase } from '../db/mongoClient.js';

class ContainerMongodb{

    coleccion;

    constructor(nombreColeccion) {
        this.coleccion = mongoDatabase.collection(nombreColeccion);
    }

    
    //PRODUCTOS y CARRITO 
    async save(objeto){
 
        try {
            await this.coleccion.insertOne(objeto)
            return objeto
        } 
        catch (error){
            throw error
        } 

      }


    //CARRITO
    async getByIdUser(usuario){
       
        try {

            const carrito = await this.coleccion.find({usuario: usuario}).toArray()

            if (!carrito){
                return null
            } else {
                return carrito [0];
            }
            
        }

        catch(error){
            throw error
        } 

    }


    //PRODUCTOS
     async getById(id){
       
        try {

            const objetoBuscado = await this.coleccion.find({_id: id}).toArray()

            if (objetoBuscado[0]===undefined){
                return null
            } else {
                return objetoBuscado[0];
            }
            
        }

        catch(error){
            throw error
        } 

     }


    //PRODUCTOS y CARRITO
     async getAll(){

        try {

            const objetoBuscado = await this.coleccion.find({}).toArray()

            if (objetoBuscado===undefined) {
                return null
            } else {
                return objetoBuscado;
            }
            
        }

        catch(error){
            throw error
        } 

    }


    //PRODUCTOS 
    async deleteById(id){
        try {
            const objetoBorrado = await this.coleccion.find({_id: id}).toArray()

         if(objetoBorrado[0]){ 
            await this.coleccion.deleteOne({_id: id})
            return objetoBorrado[0]
          } else {
            return null
          }
        }

        catch(error){
            throw error
        } 

    }

    
    //PRODUCTOS 
    async update(objeto){

        try {
            await this.coleccion.updateMany({_id: objeto._id}, {$set: {"name": objeto.name, "description": objeto.description, "price": objeto.price, "image": objeto.image}})
            return objeto;
        }
        catch(error){
            throw error
        } 
    }

    
    //CARRITO
    async save_products(objeto){
        try {
            await this.coleccion.updateOne({_id: objeto._id}, {$set: {"productos": objeto.productos}})
            return objeto;
        }
        catch(error){
            throw error
        } 
    }


    //CARRITO
    async deleteByIdCart(usuario){
        try {
            const carritoVaciado = await this.coleccion.updateOne({usuario: usuario}, {$set: {"productos": []}})
            return carritoVaciado
        }
        catch(error){
           throw error
        } 
    }


    //CARRITO
    async deleteByIdProd(indice_cart, indice_prod){
        try {
            this.cart = await this.getAll()
            const eliminado = this.cart[indice_cart].productos.splice(indice_prod, 1)
            await this.coleccion.updateOne({_id: this.cart[indice_cart]._id}, {$set: {"productos": this.cart[indice_cart].productos}})
            return eliminado
        }
        catch(error){
            throw error
        } 
    }


      //ORDENES
      async getByIdUserOrders(id){
       
        try {

            const ordenes = await this.coleccion.find({idCliente: id}).toArray()

            if(!ordenes){
                return null
            }else{
                return ordenes;
            }
            
        }

        catch(error){
            throw error
        } 

     }


 }



 export {ContainerMongodb} ;
