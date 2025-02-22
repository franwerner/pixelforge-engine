import Player from "../entity/Player.model";
import WorldModel from "../world/World.model";
import { CollisionException } from "./Collider.model";
import Motion from "./Motion.model";

interface Gravity {

  gravity: number
  mass: number
  vy: number
  rebound: number
  free_fall: {
    now?: boolean,
    active: boolean
  }
}

const rebound = 0.3

class Gravity extends Motion {
  constructor() {
    super()
    this.free_fall = {
      active: false,
      now: false
    }
    this.gravity = 6.8
    this.mass = 20
    this.vy = 30
    this.rebound = rebound
  }

  bounce(colission?: CollisionException) {
    
    if (colission && ["border", "element"].includes(colission.type) ) {
      this.vy = -(this.vy * this.rebound)
      if (Math.abs(this.vy) <= 0.1) {
        this.vy = 0
        this.rebound = 0
        this.free_fall.now = false
      }
    } else {
      this.rebound = rebound
      this.free_fall.now = true
    }
  }
  transferImpactToDownElement(colission?: CollisionException) {
    const element = colission?.element
    if (element ) {
      const transferImpact = this.vy * (1 - this.rebound)
      element.vy += transferImpact
    }
  }

  private ref_freeFall = () => {
    if (!this.free_fall.active) return
    const delta_time = (WorldModel.time.now - WorldModel.time.last)
    this.vy += this.gravity * delta_time / 1000
    const { colission } = this.ensureMove({ dx: 0, dy: this.vy })
    this.transferImpactToDownElement(colission)
    this.bounce(colission)
  }

  applyGravity() {
    WorldModel.tick.set(this.ref_freeFall)
  }

}



export default Gravity