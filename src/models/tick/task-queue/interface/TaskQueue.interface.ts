interface ITaskQueue<Queue> {
    set: Function
    get: () => Queue
    process : () => void
    clear : () => void
}

export default ITaskQueue