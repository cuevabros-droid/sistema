import {PERSISTENCIA} from '../../../config/config.js'
import { persona } from './person.js'

let Personas

switch (PERSISTENCIA) {
    case 'pg':
        const {ContainerPg} = await import('../../../daos/container/containerPg.js')     
        const dao_pg = new ContainerPg('personas');
        Personas = new persona(dao_pg)
        break 
}


export { Personas } 