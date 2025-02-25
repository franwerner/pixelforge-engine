import Position from "@/types/Position.types"
import Renderer from "../render/Renderer.model"

interface Entity {
    hasSpawned: boolean
    name : string
}
class Entity extends Renderer {
    constructor() {
        super()
        this.name = "Entity"
        this.hasSpawned = false
        this.isSolid = true
        this.free_fall = {
            active : true
        }
        this.width = 32,
        this.height = 32
    }

    pause(){
        this.free_fall.active = !this.free_fall.active
        this.free_fall.now = false
       }

    spawn(props: Position = { x: 0.1, y: 0.1 }) {
        if (this.hasSpawned) return
        this.position = {
            x: 0,
            y: 0
        }//Se resetea para hacer un spawneo correcto.
        this.ensureMove({ dy: props.y, dx: props.x })
        this.ensureMove({ dy: 0, dx: props.x })

        this.hasSpawned = true
    }

}

export { type Entity }
export default Entity