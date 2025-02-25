import worldProperties from "@/constant/world-properties.contants"
import Movement from "@/types/Movent.types"
import Position from "@/types/Position.types"
import toDecimal from "@/utils/toDecimal.utilts"

interface Hitbox {
    position: {
        x: number,
        y: number
    },
    width: number,
    height: number
    isSolid: boolean
}

type BlockInfo = {
    [K in "x" | "y"]: {
        iteration: number; // Iteración actual sobre el eje
        total: number; // Número total de bloques en ese eje
        coverage: number; //Valor real donde inicia cada bloque del a hitbox con respecto a las cordenadas y el espacio que 
        span: number; // Valor total de la hitbox en el eje, independientemente de su posición.
    }
}

const pixel = worldProperties.pixel

class Hitbox {

    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.width = 16
        this.height = 16
        this.isSolid = true
    }

    setAxis({ x = 0, y = 0 }: Position) {
        this.position = {
            x: toDecimal(x),
            y: toDecimal(y)
        }
    }

    getBounds() {
        const { x, y } = this.position
        return {
            x: {
                start: x,
                end: toDecimal(x + this.width),
            },
            y: {
                end: toDecimal(y + this.height),
                start: y
            }
        }

    }


    /**
     * Cada coverage debe ser lo que ocupa en la hitbox realmente(visulamente)
     * Es decir si el bloque mide 25 ocupara 2 bloques pero el segundo bloque solo mide se le coloca 25pixeles.
     * 
     */


    calculateBlocks<T>({ dx = 0, dy = 0 }: Movement, action: (block_info: BlockInfo) => T | void) {
        const positionY = this.position.y + dy
        const positionX = this.position.x + dx
        const residual_y = (positionY % pixel + pixel) % pixel
        const residual_x = (positionX % pixel + pixel) % pixel
        const blocksX = Math.ceil((this.width + residual_x) / pixel)
        const blocksY = Math.ceil((this.height + residual_y) / pixel)

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
                const sy = (pixel * y)
                const sx = (pixel * x)
                const spanX = this.position.x + sx
                const spanY = this.position.y + sy
                const isBreak = action({
                    x: {
                        iteration: x,
                        total: blocksX,
                        coverage: x === blocksX - 1 ? spanX - residual_x : spanX,
                        span: spanX,
                    },
                    y: {
                        iteration: y,
                        total: blocksY,
                        coverage: y === blocksY - 1 ? spanY - residual_y : spanY,
                        span: spanY
                    }
                })
                if (isBreak) {
                    return isBreak
                }
            }
        }
    }
}

export default Hitbox