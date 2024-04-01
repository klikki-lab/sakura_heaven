import { Petal } from "../sakura/petal";

export class PetalEffect extends Petal {

    private cos: number = 0;
    private sin: number = 0;

    constructor(scene: g.Scene, pos: g.CommonOffset) {
        super(scene, "img_petal");

        this.x = pos.x;
        this.y = pos.y;

        this.velocity.x = (g.game.random.generate() * 2 - 1) * this.width * (1 / g.game.fps);
        this.velocity.y = (g.game.random.generate() * 2 - 1) * this.height * (1 / g.game.fps);
        this.angle = g.game.random.generate() * 360;
        this.cos = Math.abs(Math.cos(this.angle) * (1 / g.game.fps));
        this.sin = Math.abs(Math.sin(this.angle) * (1 / g.game.fps));
        this.scale(0);
        this.opacity = 1;

        this.modified();

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.opacity *= 0.95;
        this.scaleX += this.cos;
        this.scaleY += this.cos;
        this.angle += this.cos + this.sin;
        this.modified();
        if (this.opacity <= 0.01) {
            this.destroy();
        }
    }
}