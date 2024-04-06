export class Border extends g.Sprite {

    constructor(scene: g.Scene, pos: g.CommonOffset) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_sakura_border"),
            anchorX: .5,
            anchorY: .5,
            x: pos.x,
            y: pos.y,
        });
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        this.opacity *= 0.9;
        if (this.opacity <= 0.01) {
            this.destroy();
        }
        this.modified();
    }
}