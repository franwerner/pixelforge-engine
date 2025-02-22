import Movement from "@/types/Movent.types"
import { Cell, CellElementsWithZero } from "../world/Chunk.model"
import distanceEuclides from "@/utils/distanceEuclides.utilts"
import Position from "@/types/Position.types"
import World from "../world/World.model"
import Hitbox from "./Hitbox.model"
import worldProperties from "@/constant/world-properties.contants"
import Renderer from "../render/Renderer.model"
import Axis from "@/types/Axis.types"
import Player from "../entity/Player.model"

interface ICollisionException {
    colission: boolean,
    offset: { x: number, y: number }
    element: CellElementsWithZero
    type: "border" | "element" 

}

class CollisionException {
    colission: ICollisionException["colission"]
    offset: ICollisionException["offset"]
    element: ICollisionException["element"]
    type : ICollisionException["type"]
    constructor({ element, offset, type }: Omit<ICollisionException, "colission">) {
        this.element = element
        this.colission = true
        this.offset = offset,
            this.type = type
    }

    static isInstaceOf(exception: unknown) {
        return exception instanceof CollisionException
    }
}


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
                if (res) return res
            }
        }

        if (!(element instanceof Hitbox) || element == this || (!this.isSolid && !element.isSolid)) return

        const { value, type } = axis

        const currentBounds = this.getBounds()
        const collidedBounds = element.getBounds()

        const current = currentBounds[type]
        const collided = collidedBounds[type]

        const movingRight = value > 0
        const movingLeft = value < 0

        const ColissionPrimary =
            movingRight
                ? current.end + value > collided.start && (current.start < collided.end)
                : movingLeft
                    ? current.start + value < collided.end && (current.end > collided.start)
                    : false;

        const counterAxis = type == "y" ? "x" : "y"
        const counterCurrent = currentBounds[counterAxis]

        const counterCollided = collidedBounds[counterAxis]

        const CollisionSecondary =
            (counterCurrent.end) > counterCollided.start &&
            (counterCurrent.start) < counterCollided.end


        if (!ColissionPrimary || !CollisionSecondary) return

        const offset = current.end < collided.end ? collided.start - current.end : collided.end - current.start //resultado positivo-negativo

        throw new CollisionException({
            element,
            offset: {
                [type]: offset,
                [counterAxis]: 0
            },
            type: "element"
        })

    }

    borderColission({ dy, dx }: Movement): CollisionException | undefined {
        const max_chunk = worldProperties.chunk.max_chunk_y * 512
        const endY = ((this.height) + this.position.y)
        const startY = this.position.y
        if ((endY + dy) > max_chunk || (startY + dy) < -max_chunk) {
            return new CollisionException({
                element: 0,
                offset: {
                    x: dx,
                    y: dy > 0 ? max_chunk - endY : Math.abs(startY) - max_chunk
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
         * Ya que puede estar dentr de un array de otros elementos.
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


    checkColission(props: Position, movement: Movement, visited = new Set()): CollisionException | undefined {
        const cords = `${movement.dy}|${movement.dx}`
        try {

            if (visited.has(cords)) {
                return new CollisionException({
                    element: 0,
                    offset: {
                        x: 0,
                        y: 0
                    },
                    type : ""
                })
            }
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
                // visited.add(cords)
                // const res = this.checkColission(props,{
                //     dx : e.offset.x,
                //     dy : e.offset.y
                // },visited)
                // if(res) return res
                return e
            }

        }
    }
}


export {
    CollisionException
}
export default Collider