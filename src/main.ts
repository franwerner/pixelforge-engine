import worldProperties from "./constant/world-properties.contants";
import Entity from "./models/entity/Entity.models";
import PhysicalObject from "./models/entity/PhysicalObject.model";
import Player from "./models/entity/Player.model";
import WorldModel from "@/models/world/World.model";

// new Entity().spawn({ x:32, y: 700 })
// new Entity().spawn({ x:0, y: 700 })

const player = new Player()
player.spawn({
    x : 30,
    y : 30
})

WorldModel.generateChunk({ x: 200, y: 0 })

const animate = () => {
    const ctx = WorldModel.ctx
    ctx.clearRect(0, 0, worldProperties.width, worldProperties.height)

    ctx.save()
    ctx.translate(-player.position.x + (worldProperties.width / 2), -player.position.y + (worldProperties.height / 2))

    const hasVisited = new Set<PhysicalObject>()
    /**
     * Solo una entidad podra se renderizada en el mismo ciclo de renderizado.
     * Ya que multiples chunks pueden contender pedazos de otra entidad.
     */
    WorldModel.chunks.forEach(colum => {
        colum.forEach(chunk => {
            chunk.draw()
            chunk.elements.forEach(k => {
                if (hasVisited.has(k)) return 
                hasVisited.add(k)
                k.render()
                k.physics()
            })
        })
    })

    ctx.restore()
    requestAnimationFrame(animate)
}

console.log(WorldModel)

animate()

