export const Rating = {
    BAD: {
        scoreRate: 0,
        timingWindow: {
            min: -5,
            max: 5,
        },
        path: "img_bad",
    },
    GOOD: {
        scoreRate: 1,
        timingWindow: {
            min: -4,
            max: 4,
        },
        path: "img_good",
    },
    EXCELLENT: {
        scoreRate: 2,
        timingWindow: {
            min: -2,
            max: 2,
        },
        path: "img_excellent",
    },
    PERFECT: {
        scoreRate: 3,
        timingWindow: {
            min: 0,
            max: 1,
        },
        path: "img_perfect",
    }
} as const;

export type Rating = (typeof Rating)[keyof typeof Rating];

export const withinTimingWindow = (rating: Rating, frame: number): boolean =>
    rating.timingWindow.min <= frame && rating.timingWindow.max >= frame;

export class RatingScore extends g.Sprite {

    private _frame: number = 0;

    constructor(scene: g.Scene, area: g.CommonArea, ratings: Rating) {
        super({
            scene: scene,
            src: scene.asset.getImageById(ratings.path),
            anchorX: .5,
            anchorY: .5,
            x: area.x,
            y: area.y - area.height * .5,
        });
        this.scale(1 + (ratings.scoreRate / Rating.PERFECT.scoreRate) * 1.5);
        this.onUpdate.add(this.updateHandler);
    }

    updateHandler = () => {
        if (this.scaleX >= 1) {
            this.scaleX *= 0.9;
            this.scaleY *= 0.9;
            if (this.scaleX <= 1) {
                this.scale(1);
            }
            this.modified();
        }
        if (this._frame++ >= g.game.fps) {
            this.destroy();
        }
    };
}