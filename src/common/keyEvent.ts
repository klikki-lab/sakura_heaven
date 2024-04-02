export class KeyEvent {

    onKeyDown: g.Trigger<void> = new g.Trigger();
    private isKeyDown: boolean = false;

    addListener = () => {
        if (typeof window !== "undefined") {
            window.addEventListener('keydown', this.keyDown);
            window.addEventListener('keyup', this.keyUp);
        }
    };

    removeListener = () => {
        if (typeof window !== "undefined") {
            window.removeEventListener('keydown', this.keyDown);
            window.removeEventListener('keyup', this.keyUp);
        }
    }

    private keyDown = (ev: KeyboardEvent) => {
        if (ev.key === "z" || ev.key === "Z") {
            if (this.isKeyDown) return;

            this.isKeyDown = true;
            this.onKeyDown.fire();
        }
    };

    private keyUp = (ev: KeyboardEvent) => {
        if (ev.key === "z" || ev.key === "Z") {
            this.isKeyDown = false;
        }
    };

}