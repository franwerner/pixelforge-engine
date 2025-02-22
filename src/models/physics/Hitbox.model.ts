import worldProperties from "@/constant/world-properties.contants"
import Movement from "@/types/Movent.types"
import Position from "@/types/Position.types"
import Player from "../entity/Player.model"
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
        iteration: number;
        total: number;
    };
};

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

    calculateBlocks<T>({ dx = 0, dy = 0, withResidual }: Movement & { withResidual: boolean }, action: (position: Position, block_info: BlockInfo) => T | void) {
        const positionY = this.position.y + dy
        const positionX = this.position.x + dx
        const residual_y = (positionY % pixel + pixel) % pixel
        const residual_x = (positionX % pixel + pixel) % pixel
        const xx = this.width + residual_x
        const yy = this.height + residual_y
        const blocksX = Math.ceil((xx) / pixel)
        const blocksY = Math.ceil((yy) / pixel)

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
                const isBreak = action({
                    x: this.position.x + sx,
                    y: this.position.y + sy,
                }, {
                    x: {
                        iteration: x,
                        total: blocksX
                    },
                    y: {
                        iteration: y,
                        total: blocksY
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