import Movement from "@/types/Movent.types";
import World from "../world/World.model";
import ElementsTaskQueueModel from "../tick/task-queue/ElementsTaskQueue.model";
import { CellElements } from "../world/Chunk.model";
import Collider from "./Collider.model";
import { CollisionException } from "@/utils/colissionExeception.utils";

type ElementColission = CollisionException<CellElements>
class Motion extends Collider {
    constructor() {
        super()
    }
    private getMinorDistance = (colissions: Array<ElementColission>): undefined | CollisionException<CellElements> => {
        return colissions.sort((a, b) => {
            const distanceA = Math.abs(a.offset.x) + Math.abs(a.offset.y)
            const distanceB = Math.abs(b.offset.x) + Math.abs(b.offset.y)
            return distanceA - distanceB
        })[0]
    }
    ensureMove = (props: Movement) => {
        let elementsColission: Array<ElementColission> = []
        this.calculateBlocks(props, ({ y, x }) => {
            const colission = this.checkColission({
                x: x.coverage,
                y: y.coverage
            }, props)
            if (CollisionException.isInstaceOf(colission)) {
                const isExits = elementsColission.find((element) => element.element === colission.element)
                if (!isExits) {
                    elementsColission.push(colission)
                }
            }
        })

        const getMinorDistance = this.getMinorDistance(elementsColission)
        const borderColission = !getMinorDistance && this.borderColission({ ...props })
        const colission = getMinorDistance || borderColission
        const dy = colission ? colission.offset.y : props.dy
        const dx = colission ? colission.offset.x : props.dx
        this.moveBlocks({ dx, dy })
        return {
            dx,
            dy,
            elementsColission,
            borderColission
        }
    }

    private moveBlocks(props: Movement) {
        const { dx = 0, dy = 0 } = props
        this.calculateBlocks({ dx: 0, dy: 0 }, ({ x, y }) => {
            const prev = {
                x: x.span,
                y: y.span
            }
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


        this.calculateBlocks(props, ({ x, y }) => {
            const next = {
                x: x.span + dx,
                y: y.span + dy
            }
            try {

                const next_chunk = World.getChunk(next)
                next_chunk.addElement(this)
                next_chunk.addElementInCell({ element: this, ...next })
            } catch (error) {
                throw error
            }
        })//ADD

        this.setAxis({
            y: this.position.y + dy,
            x: this.position.x + dx
        })
    }

    move(props: Movement) {
        ElementsTaskQueueModel.set(this, this.ensureMove, props)
    }

}


export default Motion