import WorldModel from "@/models/world/World.model";
import worldProperties from "./constant/world-properties.contants";
import Player from "./models/entity/Player.model";
import Renderer from "./models/render/Renderer.model";
import getFrames from "./utils/getFrames.utilts";
import Entity from "./models/entity/Entity.model";
import Collider from "./models/physics/Collider.model";



const player = new Player()

player.spawn({
    x: 0,
    y: 7500
})



// new Entity().spawn({ x: -100, y: 7450})
// new Entity().spawn({ x: -100, y: 7450})
// const t =  new Entity()
// t.spawn({ x: -100, y: 7450})
// t.name = "ASD"
// const test = new Entity()
// test.spawn({ x: -100, y: 7450})
// test.name = "TEST"



const animate = (now: number) => {
    WorldModel.time.now = now
    const ctx = WorldModel.ctx
    WorldModel.loadChunksInRange(player.position)
    const chunks = WorldModel.loadedChunks
    WorldModel.tick.process()
    ctx.clearRect(0, 0, worldProperties.width, worldProperties.height)
    ctx.save()
    ctx.translate(-player.position.x + (worldProperties.width / 2), -player.position.y + (worldProperties.height / 2))
    const hasVisited = new Set<Renderer>()
    /**
     * Solo una entidad podra se renderizada en el mismo ciclo de renderizado.
     * Ya que multiples chunks pueden contender pedazos de otra entidad.
     */
    chunks.forEach(chunk => {
        chunk.draw()
        chunk.elements.forEach(k => {
            k.draw()
            if (hasVisited.has(k)) return
            hasVisited.add(k)
            k.physics()
        })
    })
    ctx.restore()
    
    WorldModel.time.last = now
    requestAnimationFrame(animate)
}

getFrames()

animate(performance.now())

