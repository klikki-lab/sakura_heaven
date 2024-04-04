export class StartLabel extends g.Label {

    private static readonly MAX_SCALE = 1.5;

    private _beat: number = 0;
    private _ticks: number = 0;

    constructor(scene: g.Scene, font: g.DynamicFont) {
        super({
            scene: scene,
            text: "スタート！",
            font: font,
            anchorX: .5,
            anchorY: .5,
            x: g.game.width / 2,
            y: g.game.height / 2,
            scaleX: StartLabel.MAX_SCALE,
            scaleY: StartLabel.MAX_SCALE,
        });
    }

    start = (beat: number) => {
        this._beat = beat;
        this.onUpdate.add(this.updateHandler);
    };

    private updateHandler = (): void | boolean => {
        if (this._ticks++ % this._beat === 0) {
            this.scale(StartLabel.MAX_SCALE);
        } else if (this.scaleX > 1) {
            this.scale(this.scaleX * 0.92);
            if (this.scaleX <= 0.01) {
                this.scale(1);
            }
        }
        this.modified();

        if (this._ticks >= g.game.fps * 4) {
            this.destroy();
        }
    };
}