export class TitleSceneTimer extends g.Label {

    private static readonly SPACE = "  ";

    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: `開始まで ${remainingSec} 秒`,
            font: font,
            anchorX: .5,
            anchorY: .5,
        });
        this.x = g.game.width / 2;
        this.y = g.game.height - this.height * 1.5;
        this.modified();
    }

    isEnd = (): boolean => this.remainingSec <= 0;

    start = (): void => { this.onUpdate.add(this.updateHandler); };

    private spacePadding = (sec: string): string => (
        TitleSceneTimer.SPACE + sec).slice(-TitleSceneTimer.SPACE.length);

    private updateHandler = (): void => {
        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `開始まで ${sec} 秒`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec < 0) {
                this.onFinish.fire();
                this.onUpdate.destroy();
            }
        }
    };
}