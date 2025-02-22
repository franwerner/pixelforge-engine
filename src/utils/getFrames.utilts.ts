
let lastTime = performance.now()
let fps = 0

const getFrames = () => {

    const currentTime = performance.now()
    const deltaTime = currentTime - lastTime
    fps =  1000 / deltaTime
    lastTime = currentTime
    requestAnimationFrame(getFrames)
}
export default getFrames