import Gravity from "./Gravity.mode"


class PhysicalObject extends Gravity {
    constructor() {
        super()
    }

    physics() {
        this.applyGravity()
    }
}



export default PhysicalObject



