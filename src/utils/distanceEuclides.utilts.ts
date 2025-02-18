import Position from "@/types/Position.types"

const distanceEuclides = (a: Position, b: Position) => {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2
}

export default distanceEuclides

//Obtiene la distancia entre 2 puntos.