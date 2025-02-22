import Movement from "@/types/Movent.types";
import Collider, { CollisionException } from "./Collider.model";
import World from "../world/World.model";

class Motion extends Collider {
    constructor() {
        super()
    }

    ensureMove = (props: Movement) => {
        let test: Array<CollisionException> = []
        const res = this.calculateBlocks(props, (prev, { y }) => {
            const colission = this.checkColission(prev, props)

            if (CollisionException.isInstaceOf(colission)) {
                test.push(colission)
            }

            if ((y.iteration === y.total - 1) && test.length === 0 ) {
                const r = this.borderColission({ ...props })
                if (r) return r
            }
        })


        const colission = res || test.sort((a, b) => {
            if (a.element && b.element) {
                const distanceA = Math.abs(a.offset.x) + Math.abs(a.offset.y)
                const distanceB = Math.abs(b.offset.x) + Math.abs(b.offset.y)
                /**
                 * Posibles errorores : 
                 * A) X = -4 ; Y = 100 = 4;100
                 * B) x = 0 ; Y = -100 = 0;100
                 * En en caso de que nos querramos mover desde la derecha hacia la izquierda.
                 * El primero que se tomara sera el ya que es el que menos recorrido hay que hacer, por lo tnato seria el B y es incorrecto por que el A se encuentra primero.
                 * La solucion a esto el Math.abs() solo aplicar cuando el movimiento es negativo, esdecir X=-8,x= 4,
                 *  como es de izquierda a derecha se deben tener en cuenta a todos como positivos ya que si es -8 seria < 4, y logicamente no es mas cerca del elemento.
                 * Si es positivo dejarlo como esta ya que se ordena solo de menor a mayor debido a los signos
                 * 
                 *  */
                return distanceA - distanceB
            }
            else return 0
        })[0]

        const dy = colission?.offset?.y ?? props.dy
        const dx = colission?.offset?.x ?? props.dx

        if (CollisionException.isInstaceOf(colission) || !colission) {
            this.moveBlocks({ dx, dy })
        }

        
        return {
            dx,
            dy,
            colission: colission
        }
    }

    private moveBlocks(props: Movement) {
        const { dx = 0, dy = 0 } = props
        this.calculateBlocks({ dx: 0, dy: 0 }, (prev) => {
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


        this.calculateBlocks(props, (prev,info) => {
            const next = {
                x: prev.x + dx,
                y: prev.y + dy
            }
            try {

                const next_chunk = World.getChunk(next)
                next_chunk.addElement(this)
                next_chunk.addElementInCell({ element: this, ...next })
            } catch (error) {
                // console.log(next,info,this)
                throw error
            }
        })//ADD


        this.setAxis({
            y: this.position.y + dy,
            x: this.position.x + dx
        })
    }


    move(props: Movement) {

        World.tick.set(this.ensureMove, props)
    }

}


export default Motion