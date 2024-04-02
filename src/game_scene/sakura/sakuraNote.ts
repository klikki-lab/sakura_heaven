import { Rating } from "../effect/ratingScore";

export class SakuraNote extends g.Sprite {

    onFailed: g.Trigger<SakuraNote> = new g.Trigger();
    onClicked: g.Trigger<SakuraNote> = new g.Trigger();

    private _ticks: number;
    private _isJudged: boolean = false;

    constructor(scene: g.Scene, pos: g.CommonOffset, private _bpm: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_sakura_border"),
            anchorX: .5,
            anchorY: .5,
            x: pos.x,
            y: pos.y,
            scaleX: 1.2,
            scaleY: 1.2,
        });
        this._ticks = _bpm;

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void => {
        if (!this._isJudged && this._ticks-- < Rating.BAD.timingWindow.min) {
            this.onFailed.fire(this);
            this.onUpdate.remove(this.updateHandler);
            this.onUpdate.add(this.destroyHandler);
        }

        if (this.scaleX > 1) {
            this.scale(this.scaleX * 0.98);
            if (this.scaleX <= 1) {
                this.scale(1);
            }
            this.modified();
        }
    };

    private destroyHandler = (): void => {
        this.opacity *= .8;
        this.modified();
        if (this.opacity < 0.01) {
            this.destroy();
        }
    };

    judge = (): boolean => {
        if (this._isJudged || !this.isActive()) return false;

        this._isJudged = true;
        this.onClicked.fire(this);

        this.onUpdate.remove(this.updateHandler);
        this.onUpdate.add(this.destroyHandler);
        return true;
    };

    get ticks(): number { return this._ticks; }

    isActive = (): boolean => this._ticks >= Rating.BAD.timingWindow.min && this._ticks <= this._bpm / 4;
}