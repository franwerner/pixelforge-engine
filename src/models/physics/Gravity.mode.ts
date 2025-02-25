import CollisionException from "@/utils/colissionExeception.utils";
import Player from "../entity/Player.model";
import ElementsTaskQueueModel from "../tick/task-queue/ElementsTaskQueue.model";
import WorldModel from "../world/World.model";
import Motion from "./Motion.model";
import { CellElements } from "../world/Chunk.model";
import TickModel from "../tick/Tick.model";

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
type ColissionExeceptionElements = Array<CollisionException<CellElements>>
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
    this.vy = 40
    this.rebound = rebound
  }

  bounce(isColission: boolean) {
    if (isColission) {
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
  transferImpactToDownElement(colission: ColissionExeceptionElements) {
    if (colission.length) {
      const transferImpact = this.vy * (1 - this.rebound)
      const transferImpactToElement = transferImpact / colission.length
      colission.forEach(({ element }) => {
        element.vy += transferImpactToElement
      })
    }
  }

  private ref_applyGravity = () => {
    if (!this.free_fall.active) return
    const delta_time = (WorldModel.time.now - WorldModel.time.last)
    this.vy += this.gravity * delta_time / 1000
    const { borderColission, elementsColission } = this.ensureMove({ dx: 0, dy: this.vy })
    this.transferImpactToDownElement(elementsColission)
    this.bounce(!!(borderColission || elementsColission.length))

  }

  applyGravity() {
    ElementsTaskQueueModel.set(this, this.ref_applyGravity)
  }

}



export default Gravity