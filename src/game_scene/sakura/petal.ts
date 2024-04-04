import { Velocity } from "../../common/velocity";

export class Petal extends g.Sprite {

    velocity: Velocity = { x: 0, y: 0 };

    constructor(scene: g.Scene, assetId: string) {
        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            anchorX: 0.5,
            anchorY: 0.5,
        });
    }
}