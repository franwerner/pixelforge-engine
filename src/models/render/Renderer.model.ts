import PhysicalObject from "../physics/PhysicalObject.model";
import WorldModel from "../world/World.model";

class Renderer extends PhysicalObject {
    color:string
constructor(){
    super()
    this.color = "blue"
}
 draw() {
        const chunk = WorldModel.generateChunk(this.position)
        if (!chunk) return
        const ctx = WorldModel.ctx
        ctx.save()
        const { x, y } = this.position
        const { height, width } = this
        ctx.fillStyle = this.color
        ctx.strokeStyle = "red"
        ctx.strokeRect(x,y,width,height)
        ctx.fillRect(x, y, width, height)
        ctx.restore()
    }
}

export default Renderer