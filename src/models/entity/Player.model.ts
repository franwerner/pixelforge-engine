import World from "../world/World.model";
import Entity from "./Entity.models";

class Player extends Entity {
    constructor() {
        super()
        this.name = "Player"
        this.controls()
        this.isSolid = false
        this.free_fall = {
            active: false,
            now: false
        }
        this.hit_box = {
            width : 16,
            height : 34
        }
    }

    private controls() {
        //6.2323
        const pixel = 12.33
        window.addEventListener("keypress", (e) => {
            if (e.key === "a") {
                this.ensureMove({ dx: -pixel, dy: 0 })
            }
            else if (e.key === "d") {
                this.ensureMove({ dx: pixel, dy: 0 })
            }
            else if (e.key === "w" && !this.free_fall.now) {
                this.ensureMove({ dx: 0, dy: -pixel }); // Mover hacia arriba
            } else if (e.key === "s") {
                this.ensureMove({ dx: 0, dy: pixel }); // Mover hacia abajo
            } else if (e.code === "Space" && !this.free_fall.now) {
                this.ensureMove({dx: 0, dy: -50.3 })
            }
        })
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                const chunk = World.getChunk(this.position)
                console.log(chunk)
            }
        })
    }
}

export default Player