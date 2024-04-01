import { FontSize } from "../../common/fontSize";

export class CountdownTimer extends g.Label {

    private static readonly SPACE = "  ";

    onFinish: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene, font: g.DynamicFont, private remainingSec: number) {
        super({
            scene: scene,
            text: "",
            font: font,
            x: g.game.width - font.size * 5.5,
            y: font.size / 2,
        });
        this.text = `TIME ${this.spacePadding(remainingSec.toString())}`;
        this.invalidate();
    }

    isEnd = (): boolean => this.remainingSec <= 0;

    start = (): void => { this.onUpdate.add(this.updateHandler); };

    private spacePadding = (sec: string): string => (
        CountdownTimer.SPACE + sec).slice(-CountdownTimer.SPACE.length);

    private updateHandler = (): void => {
        this.remainingSec -= 1 / g.game.fps;
        const sec = Math.ceil(this.remainingSec);
        const text = `TIME ${this.spacePadding(sec.toString())}`;
        if (this.text !== text) {
            this.text = text;
            this.invalidate();

            if (sec <= 0) {
                this.onFinish.fire();
                this.onUpdate.destroy();
            }
        }
    };
}