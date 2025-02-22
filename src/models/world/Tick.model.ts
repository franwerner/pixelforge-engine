
interface Tick {
    queue: Map<Function, Function>
    nextUpdate: number
}

const TICKS_PER_SECOND = 60
const TICK_RATE = 1000 / TICKS_PER_SECOND // 60ms

/**
 * El tick esta pensado para que solo una funcion por referencia de una misma clase instnacia pueda ser ejecuta.
 * Esto evita multiples cambios en un solo ciclo de tick.
 */

class Tick {
    constructor() {
        this.queue = new Map()
        this.nextUpdate = performance.now()
    }

    set<T extends (...args: any[]) => any>(fn: T, value?: any) {
            this.queue.set(fn,()=> fn(value))
    }
    clear() {
        this.queue.clear()
    }
    process() {
        const now = performance.now()
        if (now >= this.nextUpdate) {
            this.queue.forEach(cb => {
                cb()
            })
            this.clear()
            this.nextUpdate = now + TICK_RATE
        }
    }
}
export default Tick



