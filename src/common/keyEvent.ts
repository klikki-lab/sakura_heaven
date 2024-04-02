export class KeyEvent {

    onKeyDown: g.Trigger<void> = new g.Trigger();
    private isKeyDown: boolean = false;

    addEventListener = () => {
        if (typeof window !== "undefined") {
            window.addEventListener('keydown', this.keyDownListener);
            window.addEventListener('keyup', this.keyUpListener);
        }
    };

    removeEventListener = () => {
        if (typeof window !== "undefined") {
            window.removeEventListener('keydown', this.keyDownListener);
            window.removeEventListener('keyup', this.keyUpListener);
        }
    }

    private keyDownListener = (ev: KeyboardEvent) => {
        if (ev.key === "z" || ev.key === "Z") {
            if (this.isKeyDown) return;

            this.isKeyDown = true;
            this.onKeyDown.fire();
        }
    };

    private keyUpListener = (ev: KeyboardEvent) => {
        if (ev.key === "z" || ev.key === "Z") {
            this.isKeyDown = false;
        }
    };

}