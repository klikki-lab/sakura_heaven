import { Button } from "./button";

export interface RadioButtonParams {
    text: string;
    selected?: boolean;
};

export class VerticalRadioButton extends g.E {

    private static readonly UNSELECTED_COLOR = "black";

    onClicked: g.Trigger<VerticalRadioButton> = new g.Trigger();

    private buttons: Button[] = [];

    constructor(scene: g.Scene, font: g.DynamicFont, props: RadioButtonParams[]) {
        super({ scene: scene });

        if (!props || props.length === 0) {
            throw new Error("不正な引数です");
        }

        let width = 0;
        let height = 0;
        props.forEach((prop, index) => {
            const button = new Button(scene, font, prop.text);
            button.disableAnimation();
            button.setColor(prop.selected ? Button.DEFAULT_COLOR : VerticalRadioButton.UNSELECTED_COLOR);
            if (index > 0) {
                const offsetX = this.buttons[index - 1].x + this.buttons[index - 1].width / 2 + button.width / 2;
                const margin = Button.BORDER_WIDTH / 2;
                button.x = offsetX - margin;
            }
            button.onClickDown.add(clickedButton => {
                this.buttons.forEach(button => {
                    button.setColor(clickedButton === button ? Button.DEFAULT_COLOR : VerticalRadioButton.UNSELECTED_COLOR);
                });
                this.onClicked.fire(this);
            });
            button.modified();

            this.buttons.push(button);
            this.append(button);

            width += button.width;
            height = Math.max(height, button.height);
        });

        this.width = width;
        this.height = height;
        this.modified();
    }

    getSelectedIndex(): number {
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].isNormalColor()) {
                return i;
            }
        }
        return -1;
    }
}