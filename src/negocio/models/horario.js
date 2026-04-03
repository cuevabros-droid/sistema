import { HorarioDto } from "../dtos/horarioDTO.js"
import { crearId } from "../utils/randomId.js"


class Horario{

    #id
    #detalle


    constructor({ id = crearId(), detalle }) {
        this.#id = id
        this.#detalle = detalle
    }

    get id() { return this.#id }

    get detalle() { return this.#detalle }


    datos() {
        return new HorarioDto({
            id: this.#id,  
            detalle: this.#detalle
        })
    }

}

  

 export default Horario;
