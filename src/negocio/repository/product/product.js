import Productos from '../../models/product.js'


export class product {

    #dao
    constructor(dao) {
        this.#dao = dao
    }

    
    async grabarProducto(producto) {
        try {
            const resul = await this.#dao.save(producto.datos())
            return resul
        } catch(error) {
            return error
        }
    }

    async listarProducto() {
        try {
            const dtos = await this.#dao.getAll()

          if(dtos != []){
            const datos = dtos.map(dto => new Productos(dto))
            return datos
          } else 
            return null

        } catch (error) {
            return error
        }
    }



    async actualizarProducto(producto) {
        try {
            const resul = await this.#dao.update(producto.datos())
            return resul
        } catch(error) {
            return error
        }
    }


    async eliminarProducto(id) {
        try {
            const resul = await this.#dao.deleteById(id)
            return resul
        } catch(error) {
            return error
        }
    }


    async listarProductoPorId(id) {
        try {
            const dtos = await this.#dao.getById(id)

         if(dtos){
            const datos = new Productos(dtos)
            return datos
          } else 
            return null

        } catch (error) {
            return error
        }
    }

}

