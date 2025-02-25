import { CellElementsWithZero } from "@/models/world/Chunk.model"

interface CollisionException<T = CellElementsWithZero> {
    colission: boolean,
    offset: { x: number, y: number }
    element: T
    type: "border" | "element"
}
class CollisionException<T = CellElementsWithZero> {

    constructor({ element, offset, type }: Omit<CollisionException<T>, "colission">) {
        this.element = element
        this.colission = true
        this.offset = offset,
            this.type = type
    }

    static isInstaceOf(exception: unknown) {
        return exception instanceof CollisionException
    }

    static isArray<T = CellElementsWithZero>(value: unknown): value is CollisionException<T>[] {
        return Array.isArray(value) && value.every((element) => CollisionException.isInstaceOf(element))

    }
}

export { CollisionException }
export default CollisionException
