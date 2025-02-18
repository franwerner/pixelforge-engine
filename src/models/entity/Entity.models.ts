import PhysicalObject from "./PhysicalObject.model"

interface Entity {
    hasSpawned: boolean
}
class Entity extends PhysicalObject {
    constructor() {
        super()
        this.name = "Entity"
        this.hasSpawned = false
        this.isSolid = true
        this.free_fall = {
            active : false
        }
        this.hit_box = {
            width : 16,
            height : 16
        }
    }

}

export { type Entity }
export default Entity