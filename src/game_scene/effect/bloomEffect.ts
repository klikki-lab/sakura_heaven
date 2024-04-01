import { Petal } from "../sakura/petal";

export class BloomEffect extends g.E {

    private static readonly PETALS_NUM = 5;
    private static readonly OFFSET_ANGLE = Math.PI / 2;
    private static readonly ANGLE_RATE = 360 / BloomEffect.PETALS_NUM;

    private _petals: Petal[] = [];

    constructor(scene: g.Scene, pos: g.CommonOffset, private scoreRate: number) {
        super({ scene: scene, x: pos.x, y: pos.y });

        const count = scoreRate * 3;
        for (let i = 0; i < count; i++) {
            const angle = 2 * Math.PI * (i / count) - BloomEffect.OFFSET_ANGLE;

            const petal = new Petal(scene, "img_sakura_no_gradation");

            const radius = petal.height * 0.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            petal.x = x;
            petal.y = y;
            petal.angle = i * BloomEffect.ANGLE_RATE;
            this.scale(scoreRate / 5);
            petal.velocity.x = x * 16 * (1 / g.game.fps) * (g.game.random.generate() * 2 - 1);
            petal.velocity.y = y * 16 * (1 / g.game.fps) * (g.game.random.generate() * 2 - 1);
            petal.modified();

            this.append(petal);
            this._petals.push(petal);
        }

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        let isFinish = false;
        this._petals.forEach(petal => {
            petal.x += petal.velocity.x;
            petal.y += petal.velocity.y;
            petal.velocity.x *= 0.98;
            petal.velocity.y *= 0.98;
            petal.opacity *= 0.97;
            petal.angle += this.scoreRate;
            petal.modified();

            if (petal.opacity <= 0.01) {
                isFinish = true;
                return;
            }
        });
        if (isFinish) {
            this.destroy();
        }
    };
}