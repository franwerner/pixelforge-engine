import worldProperties from "@/constant/world-properties.contants"
import Position from "@/types/Position.types"
import WorldModel from "./World.model"
import Renderer from "../render/Renderer.model"

type CellElements = Renderer
type CellElementsWithZero = CellElements | 0
type Cell = Array<Cell> | CellElements
type ChunkGrid = Array<Array<Cell | 0>>

interface Chunk {
    grid: ChunkGrid
    x: number
    y: number
}

class ChunkElements {
    elements: Set<Renderer>
    constructor() {
        this.elements = new Set()
    }

    addElement(element: Renderer) {
        this.elements.add(element)
    }

    deleteElement(element: Renderer) {
        this.elements.delete(element)
    }
}

class Chunk extends ChunkElements {
    constructor({ x, y }: { x: number, y: number }) {
        super()
        this.x = x
        this.y = y
        this.grid = [[]]
    }

    getCellPosition({ x, y }: Position) {
        const { pixel } = worldProperties
        /**
         * Con este calculo lo que haces es trabajar con las celdas en forma independiente a de la posicion absoluta.
         * Si no que la hace de forma relativa segun el grid de cada chunk.
         * Es decir ninguna posicion de relativa va a superar 512.
         * EJ:Con negativos
         * relative_x = -55 - (-512) = -55 + 512 = 427
         * EJ:Con positivos 
         * relative_x = 444 - 0 = 444 - 0 = 444
         * EJ:Mixto 
         * relative_x = -55 - 512 = -55 - 512 = -427
        */

        const relative_x = x - this.x
        const relative_y = y - this.y
        const position_x = Math.abs(Math.floor(relative_x / pixel))
        const position_y = Math.abs(Math.floor(relative_y / pixel))

        if (position_y >= worldProperties.chunk.cells_per_chunk) {
            /**
             * Esto jamaz deberia pasar, ya que la posicion en y no deberia superar el tamaño del grid.
             * En caso de que de este tipo de ERRORES hay algun problema con la deteccion de la colissiones.
             * Ya que si la colission no se detecta estaria acumulando bloques en superposiciones, y al mover alguno de los bloques superpuesto colissions en este punto
             * se haria efectiva pero los calculos de la distancias no serian los corresctos dandos valores superioes al limite.
             */
            throw new Error(`position_y es >= 32, lo que es incorrecto en un indice de un grid 0-31 ${y}-${this.y}`)
        }
        return {
            position_x,
            position_y: position_y
        }
    }

    getCell(props: Position) {
        const { position_x, position_y } = this.getCellPosition(props)
        return this.grid[position_y][position_x]
    }

    addElementInCell({ element, ...position }: { y: number, x: number, element: CellElements }) {
        const { position_x, position_y } = this.getCellPosition(position)
        const row = this.grid[position_y]

        const cell = row[position_x]
        if (Array.isArray(cell)) {
            cell.push(element)
        } else if (cell === 0) {
            row[position_x] = element
        } else {
            row[position_x] = [cell, element]
        }
    }
    deleteElementInCell({ element, ...position }: { y: number, x: number, element: Cell }) {
        const { position_x, position_y } = this.getCellPosition(position)
        const row = this.grid[position_y]
        const cell = row[position_x]
        if (Array.isArray(cell)) {
            const filter = cell.filter(i => i !== element)
            row[position_x] = filter.length == 0 ? 0 : filter.length == 1 ? filter[0] : filter
        } else if (cell === element) {
            row[position_x] = 0
        }
    }

    draw() {
        const ctx = WorldModel.ctx
        ctx.save()
        ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"
        ctx.lineWidth = 1

        const { pixel, chunk } = worldProperties
        const { cells_per_chunk } = chunk

        for (let y = 0; y < cells_per_chunk; y++) {
            for (let x = 0; x < cells_per_chunk; x++) {
                let posX = x * pixel + this.x;
                let posY = y * pixel + this.y;
                ctx.strokeRect(posX, posY, pixel, pixel);
            }
        }
        ctx.restore()
        ctx.save()
        const { x, y } = this
        const { size } = worldProperties.chunk
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, size, size)

        ctx.restore()


    }

    generateGrid() {
        const grid = []
        const max_chunks = worldProperties.chunk.cells_per_chunk
        for (let y = 0; y < max_chunks; y++) {
            const columns: CellElements | 0[] = []
            for (let x = 0; x < max_chunks; x++) {
                columns.push(0)
            }
            grid.push(columns)
        }
        this.grid = grid
        return grid
    }

}


export type { Chunk, Cell, CellElementsWithZero,CellElements }
export default Chunk