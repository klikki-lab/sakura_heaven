import { Petal } from "./petal";

export class Dispersal extends g.E {

    private static readonly PETALS_NUM = 5;
    private static readonly ANGLE_RATE = 360 / Dispersal.PETALS_NUM;
    private static readonly OFFSET_ANGLE = Math.PI / 2;

    onDispersed: g.Trigger<Dispersal> = new g.Trigger();

    private _petals: Petal[] = [];

    constructor(scene: g.Scene, pos: g.CommonOffset) {
        super({ scene: scene, x: pos.x, y: pos.y });

        for (let i = 0; i < Dispersal.PETALS_NUM; i++) {
            const angle = 2 * Math.PI * (i / Dispersal.PETALS_NUM) - Dispersal.OFFSET_ANGLE;

            const petal = new Petal(scene, "img_petal");

            const radius = petal.height * 0.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            petal.x = x;
            petal.y = y;
            petal.velocity.x = 2 * (g.game.random.generate() * 2 - 1);
            petal.velocity.y = 2 * (g.game.random.generate() + .5);
            petal.angle = i * Dispersal.ANGLE_RATE;
            petal.modified();

            this.append(petal);
            this._petals.push(petal);
        }

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        let isFinish = false;
        this._petals.forEach((petal, index) => {
            petal.x += petal.velocity.x;
            petal.y += petal.velocity.y;
            if (g.game.age % 4 === 0 && g.game.random.generate() < 0.5) {
                petal.velocity.x = 2 * (g.game.random.generate() * 2 - 1);
            }
            const rad = (g.game.age + index * g.game.fps) % (g.game.fps * 10) / 16;
            petal.scaleX = Math.cos(rad);
            petal.scaleY = Math.sin(rad);
            petal.opacity *= 0.92;
            petal.modified();

            if (petal.opacity <= 0.01) {
                isFinish = true;
                return;
            }
        });

        if (isFinish) {
            this.onDispersed.fire(this);
            this.destroy();
            return true;
        }
        return false;
    };
}