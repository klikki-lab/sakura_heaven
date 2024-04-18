type RatingProps = {
    readonly scoreRate: number,
    readonly timingWindow: {
        readonly min: number,
        readonly max: number,
    },
    readonly assetId: {
        image: string,
        sound: string,
    }
};

type Rate = "FAILED" | "BAD" | "GOOD" | "EXCELLENT" | "SEMI_PERFECT" | "PERFECT";

type RatingType = {
    [key in Rate]: RatingProps;
}

export const Rating: RatingType = {
    FAILED: {
        scoreRate: 0,
        timingWindow: {
            min: -15,
            max: 15,
        },
        assetId: {
            image: "",
            sound: "",
        }
    },
    BAD: {
        scoreRate: 0,
        timingWindow: {
            min: -5,
            max: 5,
        },
        assetId: {
            image: "img_bad",
            sound: "se_bad",
        }
    },
    GOOD: {// max score 143100
        scoreRate: 1,
        timingWindow: {
            min: -4,
            max: 4,
        },
        assetId: {
            image: "img_good",
            sound: "se_good",
        }
    },
    EXCELLENT: {// max score 159000
        scoreRate: 2,
        timingWindow: {
            min: -2,
            max: 2,
        },
        assetId: {
            image: "img_excellent",
            sound: "se_excellent",
        }
    },
    SEMI_PERFECT: {// max score 185500
        scoreRate: 3,
        timingWindow: {
            min: -1,
            max: 1,
        },
        assetId: {
            image: "img_perfect",
            sound: "se_perfect",
        }
    },
    PERFECT: {// max score 190270
        scoreRate: 3,
        timingWindow: {
            min: 0,
            max: 0,
        },
        assetId: {
            image: "img_perfect",
            sound: "se_perfect",
        }
    }
} as const;

export type Rating = (typeof Rating)[keyof typeof Rating];

export const withinTimingWindow = (frame: number): Rating => {
    if (Rating.PERFECT.timingWindow.min === frame) {
        return Rating.PERFECT;
    } else if (Rating.SEMI_PERFECT.timingWindow.min <= frame && Rating.SEMI_PERFECT.timingWindow.max >= frame) {
        return Rating.SEMI_PERFECT;
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
            src: scene.asset.getImageById(rating.assetId.image),
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