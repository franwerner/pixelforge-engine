import Position from "@/types/Position.types.js";
import ChunkModel, { Chunk } from "./Chunk.model.js"
import worldProperties from "@/constant/world-properties.contants.js";
import toDecimal from "@/utils/toDecimal.utilts.js";
import TickModel from "../tick/Tick.model.js";
import GeneralTaskQueueModel from "../tick/task-queue/GeneralTaskQueue.model.js";
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

canvas.width = worldProperties.width
canvas.height = worldProperties.height

interface World {
    ctx: CanvasRenderingContext2D
    canvas: HTMLCanvasElement
    chunks: Map<number, Map<number, Chunk>>
    time: {
        last: number,
        now: number
    }
    loadedChunks: Array<Chunk>
}

class World {
    constructor() {
        this.ctx = ctx as CanvasRenderingContext2D
        this.chunks = new Map()
        this.canvas = canvas
        this.time = {
            now: performance.now(),
            last: performance.now()
        }
        this.loadedChunks = []
    }
    private ref_loadChunksInRange = (props: Position) => {
        const { size } = worldProperties.chunk
        let loadedChunks: Array<Chunk> = []
        for (let y = 15; y >= -16; y--) {
            for (let x = 2; x >= -2; x--) {
                const offsetX = x * size + props.x;
                const offsetY = y * size + props.y;
                const chunk = this.getChunk({
                    x: offsetX,
                    y: offsetY
                })
                if (!loadedChunks.includes(chunk)) {
                    loadedChunks.push(chunk)
                }
            }
        }
        this.loadedChunks = loadedChunks
    }

    loadChunksInRange(props: Position) {
        GeneralTaskQueueModel.set(this.ref_loadChunksInRange, props)
    }

    getChunkPosition({ x, y }: Position) {
        const { max_chunk_y, size } = worldProperties.chunk
        const position_x = Math.floor(toDecimal(x) / size)
        const position_y = Math.floor(toDecimal(y) / size)

        const check = position_y >= max_chunk_y || position_y < -max_chunk_y
        const isNegativeMovent = Math.sign(y) == -1
        const limitY = check ? (isNegativeMovent ? -16 : 15) : position_y
        /**
         * Los chunks negativos su coordenadas representan el final,
         * Por lo que deben ser 16 chunks negativos.
         * En cambio los positivos representan el inicio, por lo que deben ser 15.
         * En total son 32 contando el centro (0,0)
         */
        return {
            position_x: position_x * size,
            position_y: limitY * size
        }
    }
    getChunk(props: Position): Chunk {
        const { position_x, position_y } = this.getChunkPosition(props)
        const column = this.chunks.get(position_x)
        const chunk = column?.get(position_y)
        if (!chunk) {
            return this.generateChunk(props)
        }
        return chunk
    }
    generateChunk(position: Position): Chunk {
        const { position_x, position_y } = this.getChunkPosition(position)
        const column = this.chunks.get(position_x)
        const cell = column?.get(position_y)
        if (cell) return cell
        const chunk = new ChunkModel({ x: position_x, y: position_y })

        if (column) {
            column.set(position_y, chunk)
        } else {
            this.chunks.set(position_x, new Map([[position_y, chunk]]))
        }

        chunk.generateGrid()
        return chunk
    }
}

export { type World }
export default new World