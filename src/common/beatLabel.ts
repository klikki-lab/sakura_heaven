export class BeatLabel extends g.Label {

    private static readonly MAX_SCALE = 1.5;

    private _ticks: number = 0;
    private _beat: number = 0;

    constructor(scene: g.Scene, font: g.DynamicFont, text: string, ticks: number = 0) {
        super({
            scene: scene,
            font: font,
            text: text,
            anchorX: .5,
            anchorY: .5,
            scaleX: BeatLabel.MAX_SCALE,
            scaleY: BeatLabel.MAX_SCALE,
        });
        this._ticks = ticks;
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
            this.scale(BeatLabel.MAX_SCALE);
        } else if (this.scaleX > 1) {
            this.scale(this.scaleX * 0.93);
            if (this.scaleX <= 0.01) {
                this.scale(1);
            }
        }
        this.modified();
    };
}