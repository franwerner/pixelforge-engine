
const pixel = 16
const cells_per_chunk = 32
const worldProperties = {
    width: 1920,
    height: 1080,
    pixel,
    chunk: {
        max_chunk_y: 16,
        max_chunk_x: Infinity,
        cells_per_chunk: cells_per_chunk,
        size: pixel * cells_per_chunk 
    }
}

export default worldProperties