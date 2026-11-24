import { mongoDatabase } from '../db/mongoClient.js';



class ContainerUser{

    coleccion;

    constructor(nombreColeccion) {
        this.coleccion = mongoDatabase.collection(nombreColeccion);
    }


    //USUARIO
    async save(objeto){
 
        try {
            await this.coleccion.insertOne(objeto)
            return objeto
        } 
        catch (error){
            throw error
            } 
    
    }


    //USUARIO
    async buscar_usuario(usuario){
        try {
            const user = await this.coleccion.findOne({email: usuario})
            return user
        } catch (error) {
            throw error
        }
   }


    //USUARIO
   async buscar_usuario_id(usuario){
        try {
            const user = await this.coleccion.findOne({_id: usuario})
            return user
        } catch (error) {
            throw error
        }
    }

}



export {ContainerUser};
