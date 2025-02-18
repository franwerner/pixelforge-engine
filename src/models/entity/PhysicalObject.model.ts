import Position from "@/types/Position.types"
import World from "../world/World.model"
import worldProperties from "@/constant/world-properties.contants"
import distanceEuclides from "@/utils/distanceEuclides.utilts"
import { Cell } from "../world/Chunk.model"
import Movement from "@/types/Movent.types"

interface PhysicalObject {
    isSolid: boolean
    hit_box: {
        width: number,
        height: number
    }
    position: Position
    move_step: number
    name: string
    hasSpawned: boolean
    free_fall: {
        now?: boolean,
        active: boolean
    }
}

interface ICollisionException {
    colission: boolean,
    offset: { x: number, y: number }
    cell: Cell | 0
    canPlace: boolean
}

class CollisionException {
    colission: ICollisionException["colission"]
    offset: ICollisionException["offset"]
    cell: ICollisionException["cell"]
    canPlace: ICollisionException["canPlace"]
    constructor({ cell, offset, canPlace = true }: Omit<ICollisionException, "colission">) {
        this.cell = cell
        this.colission = true
        this.offset = offset
        this.canPlace = canPlace
    }

    static isInstaceOf(exception: unknown) {
        return exception instanceof CollisionException
    }
}

const pixel = worldProperties.pixel

class PhysicalObject {
    constructor() {
        this.name = "PhysicalObject"
        this.free_fall = {
            now: false,
            active: false
        }
        this.isSolid = false
        this.hit_box = {
            width: 16,
            height: 16
        }
        this.position = {
            x: 0,
            y: 0
        }
        this.hasSpawned = false
    }

    render() {
        const chunk = World.generateChunk(this.position)
        if (!chunk) return
        const ctx = World.ctx
        ctx.save()
        const { x, y } = this.position
        const { height, width } = this.hit_box
        ctx.fillStyle = 'blue'
        ctx.fillRect(x, y, width, height)
        ctx.restore()
    }

    physics() {
        this.freeFall()
    }

    spawn(props: Position = { x: 0.1, y: 0.1 }) {
        if (this.hasSpawned) return
        this.position = {
            x: 0,
            y: 0
        }//Se resetea para hacer un spawneo correcto.
        this.ensureMove({ dy: props.y, dx: 0 })
        this.ensureMove({ dy: 0, dx: props.x })

        this.hasSpawned = true
    }

    checkPixelColission({ dx, dy, element }: { element: Cell | 0 } & Movement) {

        if (Array.isArray(element)) {
            const copied = [...element] as PhysicalObject[]
            const sorted = copied.sort((a, b) => distanceEuclides(a.position, this.position) - distanceEuclides(b.position, this.position))
            for (const i of sorted) {
                this.checkPixelColission({ dx, dy, element: i })
            }
        }

        if (!(element instanceof PhysicalObject && element !== this) || (!this.isSolid && !element.isSolid)) return

        const movible = {
            endY: (this.hit_box.height) + this.position.y,
            endX: (this.hit_box.width) + this.position.x,
            startY: this.position.y,
            startX: this.position.x
        } //Hacemos los calculos en base al valor sin el moviento siguiente.

        const _static = {
            endY: (element.hit_box.height) + element.position.y,
            startY: element.position.y,
            endX: (element.hit_box.width) + element.position.x,
            startX: element.position.x
        }

        const pixelColission =
            (movible.endX + dx) > _static.startX &&
            (movible.startX + dx) < _static.endX &&
            (movible.endY + dy) > _static.startY &&
            (movible.startY + dy) < _static.endY

        if (!pixelColission) return

        //Si es = significa que estan exactamente en el mismo pixel, por lo que se debe relocalizar el elemento hacia atras.
        const offsetX = (movible.endX) <= _static.endX ? _static.startX - movible.endX : _static.endX - movible.startX
        const offsetY = (movible.endY) <= _static.endY ? _static.startY - movible.endY : _static.endY - movible.startY

   
        console.log({
            x: dx !== 0 ? offsetX : 0,
            y: dy !== 0 ? offsetY : 0
        })
        throw new CollisionException({
            offset: {
                x: dx !== 0 ? offsetX : 0,
                y: dy !== 0 ? offsetY : 0
            },
            cell: element,
            canPlace: true
        })
    }

    checkChunkBorder({ dy, dx }: Movement) {
        const max_chunk = worldProperties.chunk.max_chunk_y * 512
        const endY = ((this.hit_box.height) + this.position.y)
        const startY = this.position.y
        if ((endY + dy) > max_chunk || (startY + dy) < -max_chunk) {
            throw new CollisionException({
                cell: 0,
                offset: {
                    x: dx,
                    y: dy > 0 ? max_chunk - endY : Math.abs(startY) - max_chunk
                },
                canPlace: true
            })
        }
    }

    checkColission(props: Position, movement: Movement, visited: Set<string> = new Set()): CollisionException | undefined {
        const lastestPosition = {
            dx: props.x + movement.dx,
            dy: props.y + movement.dy
        }
        const key = `${lastestPosition.dy}|${lastestPosition.dx}`
        try {
            if (visited.has(key)) return new CollisionException({ canPlace: false, cell: 0, offset: { x: 0, y: 0 } })
            const chunk = World.getChunk({ x: lastestPosition.dx, y: lastestPosition.dy })
            const cell = chunk.getCell({ x: lastestPosition.dx, y: lastestPosition.dy })
            this.checkChunkBorder(movement)
            this.checkPixelColission({ element: cell, ...movement })
        } catch (e) {
            if (CollisionException.isInstaceOf(e)) {
                visited.add(key)
                const res = this.checkColission(props, { dx: e.offset.x, dy: e.offset.y }, visited)
                /**
                 * Dado las nuevas cordenadas donde el elemento podra ubicarse, se hace una verificacion recursiva para indentificar si puede colocarse.
                 */
                if (!res) return e
                else return res
            }
        }
    }

    hitBox<T>({ dx = 0, dy = 0 }: Movement, action: (position: Position) => T | void) {

        const residual_y = Math.abs((this.position.y + dy)) % pixel
        const residual_x = Math.abs(this.position.x + dx) % pixel
        const blocksX = Math.ceil((this.hit_box.width + residual_x) / pixel)
        const blocksY = Math.ceil((this.hit_box.height + residual_y) / pixel)
        /**
         * Calcula los bloques ocupados por la hitbox de un objeto y ejecuta una acción en cada uno.
         * 
         * Este método toma en cuenta los residuos generados cuando `width` o `height` no son múltiplos exactos de `pixel`,
         * sumando los  residuos al tamaño total antes de calcular la cantidad de bloques.
         * Esto nos permite generar celdas residuales para que otras entidades pueden detectar que existe otra entidad en esa celda.
         * 
         * @example
         * // Supongamos que tenemos un objeto con:
         * // width = 18px, height = 20px y residuos: residual_x = 18px, residual_y = 0px
         * // 
         * // - Math.ceil((width + residual_x) / pixel) = 1.25 → 3 bloques
         * // - Math.ceil((heigth + residual_y) / pixel) = 2.25 → 2 bloques
         * // - Total: 2x3 = 6 bloques.
         */

        for (let y = 0; y < blocksY; y++) {
            for (let x = 0; x < blocksX; x++) {
                const sx = (pixel * x)
                const sy = (pixel * y)
                const isBreak = action({
                    x: this.position.x + sx,
                    y: this.position.y + sy,

                })
                if (isBreak) {
                    return isBreak
                }
            }
        }
    }

    freeFall() {
        if (!this.free_fall.active) return
        const { dy } = this.ensureMove({
            dy: worldProperties.gravity,
            dx: 0
        })

        if (dy === 0) this.free_fall.now = false
        else this.free_fall.now = true
    }
    private move(props: Movement) {
        const { dx, dy } = props

        this.hitBox({ dx: 0, dy: 0 }, (prev) => {
            const prev_chunk = World.getChunk(prev)
            prev_chunk.deleteElement(this)
            prev_chunk.elements = new Set(prev_chunk.elements)
            /**
             * Se debe reasignar una nueva referencia del setter, ya que al eliminar o agregar estamos haciendo que el bucle que utiliza elements
             * sea dinamico por lo que causaria una recursion infinita agregando y elimianndo sin parar en el mismi bucle.
             */
            prev_chunk.deleteElementInCell({
                element: this,
                ...prev
            })
        })//DELETE

        this.hitBox(props, (prev) => {
            const next = {
                x: prev.x + dx,
                y: prev.y + dy
            }
            const next_chunk = World.getChunk(next)
            if (!next_chunk.elements.has(this)) next_chunk.addElement(this)
            next_chunk.addElementInCell({ element: this, ...next })
        })//ADD

        this.position.y += dy
        this.position.x += dx
    }

    ensureMove(props: Movement) {
        const colission = this.hitBox(props, (prev) => {
            const colission = this.checkColission(prev, props)
            if (CollisionException.isInstaceOf(colission)) {
                return colission
            }
        })
        const dy = colission?.offset?.y ?? props.dy
        const dx = colission?.offset?.x ?? props.dx

        if (CollisionException.isInstaceOf(colission) && (colission.offset.x || colission.offset.y) && colission.canPlace || !colission) {
            this.move({ dx, dy })
        }

        return {
            dx,
            dy
        }
    }


}

export { PhysicalObject }
export default PhysicalObject