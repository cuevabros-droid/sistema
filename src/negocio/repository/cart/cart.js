import Carrito from '../../models/cart.js'


export class cart {

    #dao
    constructor(dao) {
        this.#dao = dao
    }

    
    async grabarCarritoUsuario(carrito) {
        try {
            const resul = await this.#dao.save(carrito.datos())
            return resul
        } catch(error) {
            return error
        }
    }


    async grabarCarrito(carrito) {
        try {
            const resul = await this.#dao.save_products(carrito.datos())
            return resul
        } catch(error) {
            return error
        }
    }



    async listarCarrito() {
        try {
            const dtos = await this.#dao.getAll()

          if(dtos != []){
            const datos = dtos.map(dto => new Carrito(dto))
            return datos
          } else 
            return null

        } catch (error) {
            return error
        }
    }


    async listarCarritoUsuario(usuario) {
        try {
            const dtos = await this.#dao.getByIdUser(usuario)
           if(dtos){
             return dtos
           } else 
             return null

        } catch (error) {
           return error
        }
    }


   async eliminarProducto(idCart, idProd) {
        try {
            const resul = await this.#dao.deleteByIdProd(idCart, idProd)
            return resul
        } catch(error) {
            return error
        }
    }


    async eliminarCarrito(usuario) {
        try {
            const resul = await this.#dao.deleteByIdCart(usuario)
            return resul
        } catch(error) {
            return error
        }
    }


}

