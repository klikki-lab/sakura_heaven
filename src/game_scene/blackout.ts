export class Blackout extends g.FilledRect {

    onStartGame: g.Trigger<void> = new g.Trigger();

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            width: g.game.width,
            height: g.game.height,
            cssColor: "black",
            opacity: 0.5,
        });
    }

    close = (): void => {
        this.onStartGame.fire();
        this.destroy();
    };
}