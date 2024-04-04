export class Button extends g.FilledRect {

    static readonly DEFAULT_COLOR = "#ffaaaa";
    static readonly BORDER_WIDTH = 8;
    private static readonly SCALE_RATE = .9;

    onClickDown: g.Trigger<Button> = new g.Trigger();
    onClicked: g.Trigger<Button> = new g.Trigger();

    private _rect: g.FilledRect;
    private isClick: boolean = false;
    private _disabelAnimation: boolean = false;

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
        this._rect = new g.FilledRect({
            scene: scene,
            parent: this,
            width: this.width - Button.BORDER_WIDTH,
            height: this.height - Button.BORDER_WIDTH,
            cssColor: color,
            anchorX: 0.5,
            anchorY: 0.5,
            x: this.width / 2,
            y: this.height / 2,
            touchable: true,
        })

        label.x = this.width / 2;
        label.y = this.height / 2;
        this.append(label);

        const setScale = (scale: number): void => {
            if (this._disabelAnimation) return;

            this.scale(scale);
            this.modified();
        };

        this._rect.onPointDown.add(_ev => {
            this.isClick = true;
            setScale(Button.SCALE_RATE);
            this.onClickDown.fire(this);
        });

        this._rect.onPointMove.add(ev => {
            const ex = ev.point.x + ev.startDelta.x;
            const ey = ev.point.y + ev.startDelta.y;
            this.isClick = this.isClick && 0 <= ex && this.width >= ex && 0 <= ey && this.height >= ey;
            setScale(this.isClick ? Button.SCALE_RATE : 1.0);
        });

        this._rect.onPointUp.add(_ev => {
            setScale(1.0);
            if (this.isClick) {
                this.onClicked.fire(this);
                this.isClick = false;
            }
        });
    }

    setColor = (color: string) => {
        this._rect.cssColor = color;
        this._rect.modified();
    };

    isNormalColor = (): boolean => this._rect.cssColor === Button.DEFAULT_COLOR;

    disableAnimation = (): void => { this._disabelAnimation = true; }
}