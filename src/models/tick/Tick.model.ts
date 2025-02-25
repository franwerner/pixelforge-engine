import ElementsTaskQueueModel, { ElementsTaskQueue } from "./task-queue/ElementsTaskQueue.model"
import GeneralTaskQueueModel, { GeneralTaskQueue } from "./task-queue/GeneralTaskQueue.model"

interface Tick {
    elementsTaskQueue: ElementsTaskQueue
    generalTaskQueue: GeneralTaskQueue
    nextUpdate: number
    tickCount : number
}

const TICKS_PER_SECOND = 60
const TICK_RATE = 1000 / TICKS_PER_SECOND // 60ms
class Tick {
    constructor() {
        this.nextUpdate = performance.now()
        this.elementsTaskQueue = ElementsTaskQueueModel
        this.generalTaskQueue = GeneralTaskQueueModel
        this.tickCount = 0
    }

    getTaks() {
        return [
            this.elementsTaskQueue,
            this.generalTaskQueue
        ]
    }

    clear() {
        this.getTaks().forEach(task => task.clear())
    }

    run() {
        const now = performance.now()
        if (now >= this.nextUpdate) {
            this.getTaks().forEach(task => task.process())
            this.clear()
            this.nextUpdate = now + TICK_RATE
            this.tickCount++;
        }
    }
}
export { type Tick }
export default new Tick()



