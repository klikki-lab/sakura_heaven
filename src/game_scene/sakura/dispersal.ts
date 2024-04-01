import { Petal } from "./petal";

export class Dispersal extends g.E {

    private static readonly PETALS_NUM = 5;
    private static readonly ANGLE_RATE = 360 / Dispersal.PETALS_NUM;
    private static readonly OFFSET_ANGLE = Math.PI / 2;

    onDispersed: g.Trigger<Dispersal> = new g.Trigger();

    private _petals: Petal[] = [];
    private _ticks: number = 0;

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
            petal.velocity.x = 4 * (g.game.random.generate() * 2 - 1);
            petal.velocity.y = 2 * (2 - g.game.random.generate());
            petal.angle = i * Dispersal.ANGLE_RATE;
            petal.modified();

            this.append(petal);
            this._petals.push(petal);
        }

        // this.disperse();
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = () => {
        let isFinish = false;
        this._petals.forEach(petal => {
            petal.x += petal.velocity.x;
            petal.y += petal.velocity.y;
            if (g.game.age % 4 === 0) {
                petal.velocity.x = 4 * (g.game.random.generate() * 2 - 1);
            }
            const rad = g.game.age % (g.game.fps * 10) / 8;
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
        // this._ticks++;
        // if (this._ticks >= g.game.fps) {
        //     this.onDispersed.fire(this);
        //     this.destroy();
        //     return true;
        // }
        return false;
    };

    // disperse = (): void => {
    //     const rate = 1 / g.game.fps;
    //     this._petals.forEach(petal => {
    //         petal.velocity.x = (g.game.random.generate() * 2 - 1) * 2 * petal.width * rate;
    //         petal.velocity.y = (g.game.random.generate() + 1) * 3 * petal.height * rate;
    //     });

    //     this.onUpdate.add(this.updateHandler);
    // };
}