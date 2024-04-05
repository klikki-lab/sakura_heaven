import { Button } from "./button";

export interface RadioButtonParams {
    text: string;
    selected?: boolean;
};

export class HorizontalRadioButton extends g.E {

    private static readonly UNSELECTED_COLOR = "#422";

    onClicked: g.Trigger<HorizontalRadioButton> = new g.Trigger();

    private buttons: Button[] = [];

    constructor(scene: g.Scene, font: g.DynamicFont, texts: string[], private selectedIndex: number = 0) {
        super({ scene: scene });

        if (!texts || texts.length === 0) {
            throw new Error(`texts is invalid arg: texts = ${texts}`);
        }
        if (selectedIndex < 0 || selectedIndex >= texts.length) {
            throw new Error(`selectedIndex is invalid arg: selectedIndex = ${selectedIndex}`);
        }

        let width = 0;
        let height = 0;
        texts.forEach((text, index) => {
            const button = new Button(scene, font, text);
            button.disableAnimation();
            this.setColor(button, selectedIndex === index);
            if (index > 0) {
                const offsetX = this.buttons[index - 1].x + this.buttons[index - 1].width / 2 + button.width / 2;
                button.x = offsetX - button.getMargin();
            }
            button.onClickDown.add(clickedButton => {
                this.buttons.forEach((button, index) => {
                    this.setColor(button, clickedButton === button);
                    if (clickedButton === button) {
                        this.selectedIndex = index;
                    }
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

    private setColor = (button: Button, selected: boolean) => {
        button.setColor(selected ? Button.DEFAULT_COLOR : HorizontalRadioButton.UNSELECTED_COLOR);
    }

    getSelectedIndex = (): number => this.selectedIndex;
}