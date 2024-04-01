export class Button extends g.FilledRect {

    private static readonly DEFAULT_COLOR = "#ffaaaa";
    private static readonly SCALE_UP_RATE = 1.1;

    onClick: g.Trigger<Button> = new g.Trigger();
    onClicked: g.Trigger<Button> = new g.Trigger();

    private within: boolean = false;

    constructor(scene: g.Scene, font: g.DynamicFont, text: string, color: string = Button.DEFAULT_COLOR) {

        const label = new g.Label({
            scene: scene,
            font: font,
            text: text,
            anchorX: 0.5,
            anchorY: 0.5,
        });

        const maxLength = text.length;
        const maxWidth = maxLength * label.fontSize;
        super({
            scene: scene,
            width: maxWidth + (maxWidth / maxLength) * 2,
            height: label.height * 2,
            cssColor: color,
            anchorX: 0.5,
            anchorY: 0.5,
            touchable: true,
        });

        label.x = this.width / 2;
        label.y = this.height / 2;
        this.append(label);

        const setScale = (scale: number) => {
            this.scale(scale);
            this.modified();
        };

        this.onPointDown.add(_ev => {
            this.within = true;
            setScale(Button.SCALE_UP_RATE);
            this.onClick.fire(this);
        });

        this.onPointMove.add(ev => {
            const ex = ev.point.x + ev.startDelta.x;
            const ey = ev.point.y + ev.startDelta.y;
            this.within = this.within && 0 <= ex && this.width >= ex && 0 <= ey && this.height >= ey;
            setScale(this.within ? Button.SCALE_UP_RATE : 1.0);
        });

        this.onPointUp.add(_ev => {
            setScale(1.0);
            if (this.within) {
                this.onClicked.fire(this);
                this.within = false;
            }
        });
    }
}