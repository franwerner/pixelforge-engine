import Hitbox from "@/models/physics/Hitbox.model"
import ITaskQueue from "./interface/TaskQueue.interface"
import WorldModel from "@/models/world/World.model"

type ElementTaskKey = Hitbox

/**
 * Cada elemento agrupa su conjunto de tareas que debe realizar.
 * Se ordenan de acuerdo a la prioridad de resolución.
 */

type Queue = Map<ElementTaskKey, Map<Function, Function>>
interface ElementsTaskQueue extends ITaskQueue<Queue> {}

 class ElementsTaskQueue {
    private queue: Queue
    constructor() {
        this.queue = new Map()
    }
    set<T extends (...args: any[]) => any>(key: ElementTaskKey, fn: T, values?: any) {
        if(WorldModel.pause) return
        const elementTask = this.queue.get(key)
        if (elementTask) {
            elementTask.set(fn, () => fn(values))
        } else {
            this.queue.set(key, new Map([[fn, () => fn(values)]]))
        }
    }
    clear(){
        this.queue.clear()
    }
    get() {
        return new Map(Array.from(this.queue)
            .sort((a, b) => {
                const [elementA] = a
                const [elementB] = b
                /**
             * El criterio que se tienen en cuenta es el siguiente:
             * Mayor velocidad, más prioridad para resolverse.
             * Esto se debe a que, si un objeto se mueve mucho más rápido que otro,
             * es probable que colisione con el otro antes de que este se mueva,
             * como en el caso de un objeto que cae desde arriba con una alta velocidad 
             * y otro que recién empieza a caer. En ese caso, el objeto más rápido
             * debe resolver la colisión primero, ya que impactará antes.
             * 
             */
                return (elementB.position.y) - (elementA.position.y)
            }))
    }
    process() {
        this.get().forEach((e) => e.forEach((fn) => fn()))
    }

}

export { type ElementsTaskQueue }
export default new ElementsTaskQueue()