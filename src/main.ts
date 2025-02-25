import WorldModel from "@/models/world/World.model";
import worldProperties from "./constant/world-properties.contants";
import Player from "./models/entity/Player.model";
import Renderer from "./models/render/Renderer.model";
import getFrames from "./utils/getFrames.utilts";
import Entity from "./models/entity/Entity.model";
import TickModel from "./models/tick/Tick.model";

const player = new Player()



// new Entity().spawn({ x: -100, y: -3450})
// const black = new Entity()
// black.spawn({ x: -100, y: -3450})
// black.color = "black"
// const t =  new Entity()
// t.spawn({ x: -100, y: -3450})
// t.name = "ASD"
// t.color = "green"
// const test = new Entity()
// test.spawn({ x: -100, y: -3450})
// test.name = "TEST"
// test.color ="red"

player.spawn({
    x: -80,
    y: -3410
})

const animate = (now: number) => {
    WorldModel.time.now = now
    const ctx = WorldModel.ctx
    WorldModel.loadChunksInRange(player.position)
    const chunks = WorldModel.loadedChunks
    TickModel.run()
    ctx.clearRect(0, 0, worldProperties.width, worldProperties.height)
    ctx.save()
    ctx.translate(-player.position.x + (worldProperties.width / 2), -player.position.y + (worldProperties.height / 2))
    const hasVisited = new Set<Renderer>()
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

