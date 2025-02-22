import World from "../world/World.model";
import Entity from "./Entity.model";

class Player extends Entity {
    constructor() {
        super()
        this.name = "Player"
        this.controls()
        this.isSolid = false
        this.free_fall = {
            active: false,
        }
        this.width = 25
        this.height = 16
    }

 
    private controls() {
        //6.2323
        const pixel = 8
        window.addEventListener("keypress", (e) => {
            if (e.key === "a") {
                this.move({ dx: -pixel, dy: 0 })
            }
            else if (e.key === "d") {
                this.move({ dx: pixel, dy: 0 })
            }
            else if (e.key === "w") {
                this.move({ dx: 0, dy: -pixel }); // Mover hacia arriba
            } else if (e.key === "s") {
                this.move({ dx: 0, dy: pixel }); // Mover hacia abajo
            } else if (e.code === "Space" && !this.free_fall.now) {
                this.move({ dx: 0, dy: -50.3 })
            }
        })
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                const chunk = World.getChunk(this.position)
                console.log(World.chunks)
                console.log(chunk)
            } else if (e.key === "f") {
                this.free_fall.active = !this.free_fall.active
                this.free_fall.now = false
                this.vy = 0
            } else if (e.key === "t") {
                World.loadChunksInRange(this.position)
            }
        })
    }
}

export default Player