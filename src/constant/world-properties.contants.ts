
const pixel = 16
const worldProperties = {
    width: 1920,
    height: 1080,
    pixel,
    chunk: {
        max_chunk_y: 16,
        max_chunk_x: Infinity,
        cells_per_chunk: 32,
        size: 512 //pixel x cells_per_chunk
    }
}

export default worldProperties