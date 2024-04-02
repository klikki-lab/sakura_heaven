type RatingProps = {
    readonly scoreRate: number,
    readonly timingWindow: {
        readonly min: number,
        readonly max: number,
    },
    readonly imageId: string,
    readonly audioId: string,
};

type Rate = "BAD" | "GOOD" | "EXCELLENT" | "PERFECT";

type RatingType = {
    [key in Rate]: RatingProps;
}

export const Rating: RatingType = {
    BAD: {
        scoreRate: 0,
        timingWindow: {
            min: -5,
            max: 5,
        },
        imageId: "img_bad",
        audioId: "se_bad",
    },
    GOOD: {
        scoreRate: 1,
        timingWindow: {
            min: -4,
            max: 4,
        },
        imageId: "img_good",
        audioId: "se_good",
    },
    EXCELLENT: {
        scoreRate: 2,
        timingWindow: {
            min: -2,
            max: 2,
        },
        imageId: "img_excellent",
        audioId: "se_excellent",
    },
    PERFECT: {
        scoreRate: 3,
        timingWindow: {
            min: 0,
            max: 1,
        },
        imageId: "img_perfect",
        audioId: "se_perfect",
    }
} as const;

export type Rating = (typeof Rating)[keyof typeof Rating];

export const withinTimingWindow = (frame: number): Rating => {
    if (Rating.PERFECT.timingWindow.min <= frame && Rating.PERFECT.timingWindow.max >= frame) {
        return Rating.PERFECT;
    } else if (Rating.EXCELLENT.timingWindow.min <= frame && Rating.EXCELLENT.timingWindow.max >= frame) {
        return Rating.EXCELLENT;
    } else if (Rating.GOOD.timingWindow.min <= frame && Rating.GOOD.timingWindow.max >= frame) {
        return Rating.GOOD;
    }
    return Rating.BAD;
}

export class RatingScore extends g.Sprite {

    private _frame: number = 0;

    constructor(scene: g.Scene, area: g.CommonArea, rating: Rating) {
        super({
            scene: scene,
            src: scene.asset.getImageById(rating.imageId),
            anchorX: .5,
            anchorY: .5,
            x: area.x,
            y: area.y - area.height * .75,
        });
        this.scale(1 + (rating.scoreRate / Rating.PERFECT.scoreRate) * 1.5);
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