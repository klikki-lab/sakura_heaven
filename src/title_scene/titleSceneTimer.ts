export class TitleSceneTimer extends g.Label {

    private static readonly SPACE = "  ";

    onFinish: g.Trigger<void> = new g.Trigger();
    private isStop: boolean = false;

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `開始まで${remainingSec} 秒`,
            font: font,
            anchorX: .5,
            anchorY: .5,
        });
        this.x = g.game.width / 2;
        this.y = g.game.height - this.height * 2;
        this.modified();
    }

    isEnd = (): boolean => this.remainingSec <= 0;

    start = (): void => { this.onUpdate.add(this.updateHandler); };

    stop = () => {
        this.isStop = true;
        if (this.onUpdate.contains(this.updateHandler)) {
            this.onUpdate.remove(this.updateHandler);
        }
    }

    private updateHandler = (): void => {
        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `開始まで ${sec} 秒`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec < 0 && !this.isStop) {
                this.onFinish.fire();
                this.onUpdate.destroy();
            }
        }
    };
}