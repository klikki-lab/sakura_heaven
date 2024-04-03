import { Rating } from "../effect/ratingScore";

export class Score extends g.Label {

    private static readonly SCORE = 100;
    private _combo: number = 0;
    private _perfectCount: number = 0;
    private _maxCombo: number = 0;
    private _bloomimg: number = 0;

    constructor(scene: g.Scene, font: g.DynamicFont) {
        super({
            scene: scene,
            font: font,
            text: `SCORE  ${g.game.vars.gameState.score}`,
            x: font.size,
            y: font.size / 2,
        });
    }

    get blooming(): number { return this._bloomimg; }

    get maxCombo(): number { return this._maxCombo - 1; }

    get perfectCount(): number { return this._perfectCount; }

    add = (rating: Rating): number => {
        let bonus = 0;
        if (rating.scoreRate >= Rating.SEMI_PERFECT.scoreRate) {
            this._combo++;
            this._perfectCount++;
            if (Rating.PERFECT === rating) {
                bonus = 10;
            }
        } else {
            this._combo = 0;
            if (rating.scoreRate === Rating.BAD.scoreRate) {
                return 0;
            }
        }

        this._maxCombo = Math.max(this._combo, this._maxCombo);
        this._bloomimg++;

        const result = (Score.SCORE + bonus) * (1 << (rating.scoreRate - 1)) * Math.max(1, this._combo);
        g.game.vars.gameState.score += result;
        this.text = `SCORE ${g.game.vars.gameState.score}`;
        this.invalidate();
        return result;
    };
} 