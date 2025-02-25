import Movement from "@/types/Movent.types"
import { Cell, CellElements, CellElementsWithZero } from "../world/Chunk.model"
import distanceEuclides from "@/utils/distanceEuclides.utilts"
import Position from "@/types/Position.types"
import World from "../world/World.model"
import Hitbox from "./Hitbox.model"
import worldProperties from "@/constant/world-properties.contants"
import Renderer from "../render/Renderer.model"
import Axis from "@/types/Axis.types"
import CollisionException from "@/utils/colissionExeception.utils"
import TickModel from "../tick/Tick.model"

class Collider extends Hitbox {
    constructor() {
        super()
    }

    private getCell({ x, y }: Position) {
        const chunk = World.getChunk({ x, y })
        const cell = chunk.getCell({ x, y })
        return cell
    }

    pixelColission({ element, axis }: { element: Cell | 0, axis: Axis }): CollisionException | undefined {

        if (Array.isArray(element)) {
            const copied = [...element] as Renderer[]

            const sorted = copied.sort((a, b) => distanceEuclides(a.position, this.position) - distanceEuclides(b.position, this.position)).filter(i => i !== this)
            for (const i of sorted) {
                const res = this.pixelColission({ element: i, axis })
            }
        }

        if (!(element instanceof Hitbox) || element == this || (!this.isSolid && !element.isSolid)) return

        const { value, type } = axis
        const currentBounds = this.getBounds()
        const collidedBounds = element.getBounds()
        const current = currentBounds[type]
        const collided = collidedBounds[type]

        const colissionCurrentAxis =
            value > 0
                ? current.end + value > collided.start && (current.start < collided.end)
                : current.start + value < collided.end && (current.end > collided.start)

        const counterAxis = type == "y" ? "x" : "y"
        const counterCurrent = currentBounds[counterAxis]

        const counterCollided = collidedBounds[counterAxis]

        const colissionCounterAxis =
            counterCurrent.end > counterCollided.start &&
            counterCurrent.start < counterCollided.end
        if (!colissionCurrentAxis || !colissionCounterAxis) return


        const offset = current.end < collided.end ? collided.start - current.end : collided.end - current.start //resultado positivo-negativo
        throw new CollisionException<CellElements>({
            element,
            offset: {
                [type]: offset,
                [counterAxis]: 0
            },
            type: "element"
        })

    }

    borderColission({ dy, dx }: Movement): CollisionException<0> | undefined {
        const max_chunk = worldProperties.chunk.max_chunk_y * worldProperties.chunk.size
        const { end, start } = this.getBounds().y
        if ((end + dy) > max_chunk || (start + dy) < -max_chunk) {
            return new CollisionException<0>({
                element: 0,
                offset: {
                    x: dx,
                    y: dy > 0 ? max_chunk - end : Math.abs(start) - max_chunk
                },
                type: "border"
            })
        }
    }


    rangeColission({ movement, type, value, counter_type }: Axis & { movement: number, counter_type: number }) {
        if (movement === 0) return
        const stepSize = worldProperties.pixel

        const steps = Math.ceil(Math.abs(movement) / stepSize) + 1
        /**
         * Sumamos +1, para que su propio eje tambien se incluya revisar nuevamente.
         * Ya que puede estar dentro de un array de otros elementos.
         */
        const step = Math.sign(movement) * stepSize
        const residual = movement % stepSize
        /**
        * Para una correcta indentifcacion de celdas, se deben usar steps que sean steps <= pixel,
        * No se debe superar el tamaño de la celdas, ya que causaria saltos .
        */
        let acc = 0
        for (let i = 0; i < steps; i++) {
            if (i !== 0) {
                acc += (i === steps - 1 && residual !== 0) ? residual : step
            }
            const y = type == "y" ? value + acc : counter_type
            const x = type == "x" ? value + acc : counter_type
            const element = this.getCell({ x: x, y: y })
            this.pixelColission({
                axis: {
                    type: type,
                    value: movement
                }, element
            })
        }
    }


    checkColission(props: Position, movement: Movement) {
        try {

            this.rangeColission({
                counter_type: props.x,
                movement: movement.dy,
                type: "y",
                value: props.y
            })
            this.rangeColission({
                counter_type: props.y,
                movement: movement.dx,
                type: "x",
                value: props.x
            })
        } catch (e) {
            if (CollisionException.isInstaceOf(e)) {
                return e
            }
        }
    }
}



export default Collider