import { Rating } from "../effect/ratingScore";

export class Score extends g.Label {

    private static readonly BASE_SCORE = 100;
    private static readonly COMPLETERY_PERFECT_SCORE = 155290;

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

    get maxCombo(): number { return this._maxCombo; }

    get perfectCount(): number { return this._perfectCount; }

    isAbsolutelyPerfect = (): boolean => g.game.vars.gameState.score >= Score.COMPLETERY_PERFECT_SCORE;

    add = (rating: Rating): number => {
        let bonus = 0;
        if (rating.scoreRate >= Rating.GOOD.scoreRate) {
            this._combo++;
            if (rating.scoreRate >= Rating.SEMI_PERFECT.scoreRate) {
                this._perfectCount++;
                if (Rating.PERFECT === rating) {
                    bonus = 10;
                }
            }
        } else {
            this._combo = 0;
            if (rating.scoreRate === Rating.BAD.scoreRate) {
                return 0;
            }
        }

        this._maxCombo = Math.max(this._combo, this._maxCombo);
        this._bloomimg++;

        const result = (Score.BASE_SCORE + bonus) * rating.scoreRate + (this._combo - 1) * Score.BASE_SCORE;
        g.game.vars.gameState.score += result;
        this.text = `SCORE ${g.game.vars.gameState.score}`;
        this.invalidate();
        return result;
    };
} 