import ITaskQueue from "./interface/TaskQueue.interface";

type Queue = Map<Function, Function>

interface GeneralTaskQueue extends ITaskQueue<Queue> { }

class GeneralTaskQueue {
    private queue: Queue
    constructor() {
        this.queue = new Map()
    }
    set(fn: Function, value?: any) {
        this.queue.set(fn, () => fn(value))
    }
    get() {
        return this.queue
    }
    clear(){
        this.queue.clear()
    }
    process() {
        this.get().forEach((fn) => fn())
    }
}

export { type GeneralTaskQueue }
export default new GeneralTaskQueue()