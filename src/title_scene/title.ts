export class TitleLabel extends g.Label {

    private _ticks: number = 0;
    private _beat: number = 0;

    constructor(scene: g.Scene, font: g.DynamicFont) {
        super({
            scene: scene,
            font: font,
            text: "SAKURA HEAVEN",
            anchorX: .5,
            anchorY: .5,
            x: g.game.width / 2,
            y: font.size * 1.5,
        });
    }

    start = (beat: number) => {
        this._beat = beat;
        this.onUpdate.add(this.updateHandler);
    };

    restart = () => {
        this._ticks = 0;
        this.scale(1);
        this.modified();
    }

    private updateHandler = (): void | boolean => {
        if (this._ticks++ % this._beat === 0) {
            this.scale(1.25);
        } else if (this.scaleX > 1) {
            this.scale(this.scaleX * 0.95);
            if (this.scaleX <= 0.01) {
                this.scale(1);
            }
        }
        this.modified();
    };
}