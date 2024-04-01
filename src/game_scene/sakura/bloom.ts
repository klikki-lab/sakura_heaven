import { Rating } from "../effect/ratingScore";

export class Bloom extends g.Sprite {

    private frames: number = 0;

    constructor(scene: g.Scene, pos: g.CommonOffset, scoreRate: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_sakura"),
            anchorX: .5,
            anchorY: .5,
            x: pos.x,
            y: pos.y,
            opacity: 1,
        });
        this.scale(1 + (scoreRate / Rating.PERFECT.scoreRate));

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        this.scale(Math.max(1, this.scaleX * 0.95));
        if (this.scaleX === 1) {
            this.opacity *= 0.98;
            if (this.opacity <= 0.01) {
                this.destroy();
            }
        }
        this.modified();
    }
}