import { PersonaDto } from "../dtos/personaDTO.js"
import { crearId } from "../utils/randomId.js"


class Personas{

    #id
    #apellido
    #nombre

    constructor({ _id = crearId(), apellido, nombre }) {
        this.#id = _id
        this.#apellido = apellido
        this.#nombre = nombre

    }

    get id() { return this.#id }

    get apellido() { return this.#apellido }

    get nombre() { return this.#nombre }


    datos() {
        return new PersonaDto({
            _id: this.#id,  
            apellido: this.#apellido,  
            nombre: this.#nombre
        })
    }

}

  

 export default Personas;
