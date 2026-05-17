import Usuario from '../../models/user.js'


export class user {

    #dao
    constructor(dao) {
        this.#dao = dao
    }

    
    async grabarUsuario(usuario) {
        try {
            const resul = await this.#dao.save(usuario.datos())
            return resul
        } catch(error) {
            return error
        }
    }

    async buscar_usuario(usuario) {
        try {
            const resul = await this.#dao.buscar_usuario(usuario)

           if(resul){
            const usermodel = new Usuario(resul)
            return usermodel
           } else 
            return null

        } catch(error) {
            return error
        }
    }

    async usuarioInfo(usuario) {
        try {
            const usuarioBuscado = await this.#dao.buscar_usuario_id(usuario._id)

           if(usuarioBuscado){
            const usermodel = new Usuario(usuarioBuscado)
            return usermodel
           } else 
            return null
            
        } catch(error) {
            return error
        }
    }              

}

