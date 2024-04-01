export class NoteGuide extends g.Sprite {

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

    beat = (): void => {
        this.scale(1.5);
        this.modified();
    };

    private updateHandler = (): void | boolean => {
        if (this.scaleX === 1) {
            return;
        }

        this.scale(this.scaleX *= 0.9);
        if (this.scaleX <= 1) {
            this.scale(1);
        }
        this.modified();
    };
}