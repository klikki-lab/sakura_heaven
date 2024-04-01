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
            const vx = Math.cos(angle);
            const vy = Math.sin(angle);
            petal.x = vx * radius;
            petal.y = vy * radius;
            petal.angle = i * Dispersal.ANGLE_RATE;
            // petal.opacity = 0.8;
            // petal.velocity.x = ((vx * radius * Sakura.RADIUS_RATE) - petal.x) / steps;
            // petal.velocity.y = ((vy * radius * Sakura.RADIUS_RATE) - petal.y) / steps;
            petal.modified();

            this.append(petal);
            this._petals.push(petal);
        }

        this.disperse();
    }

    private updateHandler = () => {
        this._petals.forEach(petal => {
            petal.x += petal.velocity.x;
            petal.y += petal.velocity.y;
            petal.velocity.x *= 0.97;
            petal.velocity.y *= 0.97;
            petal.opacity = 1 - this._ticks / g.game.fps;
            petal.scale(petal.opacity);
            petal.angle += petal.velocity.y;
            petal.modified();
        });
        this._ticks++;
        if (this._ticks >= g.game.fps) {
            this.onDispersed.fire(this);
            this.destroy();
            return true;
        }
        return false;
    };

    disperse = (): void => {
        const rate = 1 / g.game.fps;
        this._petals.forEach(petal => {
            petal.velocity.x = (g.game.random.generate() * 2 - 1) * 2 * petal.width * rate;
            petal.velocity.y = (g.game.random.generate() + 1) * 3 * petal.height * rate;
        });

        this.onUpdate.add(this.updateHandler);
    };
}