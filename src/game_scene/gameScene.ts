import { FontSize } from "../common/fontSize";
import { GameMainParameterObject } from "../parameterObject";
import { Chart } from "./chart/chart";
import { ChartSequencer } from "./chart/chartSequencer";
import { PetalEffect } from "./effect/petalEffect";
import { Rating, RatingScore, withinTimingWindow } from "./effect/ratingScore";
import { CountdownTimer } from "./hud/countdownTimer";
import { Score } from "./hud/score";
import { Dispersal } from "./sakura/dispersal";
import { Bloom } from "./sakura/bloom";
import { SakuraNote } from "./sakura/sakuraNote";
import { NoteGuide } from "./sakura/noteGuide";
import { BloomEffect } from "./effect/bloomEffect";
import { StartLabel } from "./startLabel";
import { ArrayUtil } from "../common/arrayUtil";
import { TitleSceneParams } from "../title_scene/titleScene";
import { Common } from "../common/common";
import { Blackout } from "./blackout";

export class GameScene extends g.Scene {

    private sequencer: ChartSequencer;
    private posTable: g.CommonOffset[] = [];
    private guide: NoteGuide;
    private effectLayer: g.E;
    private notesLayer: g.E;
    private bloomLayer: g.E;
    private ratingLayer: g.E;
    private hudLayer: g.E;
    private font: g.DynamicFont;
    private score: Score;
    private timer: CountdownTimer;
    private blackout: Blackout;
    private waitMessage: g.Label;

    constructor(_param: GameMainParameterObject, private _timeLimit: number, private volume: number, private params: TitleSceneParams) {
        super({
            game: g.game,
            assetIds: [
                "img_sakura", "img_sakura_no_gradation", "img_sakura_border", "img_petal",
                "img_perfect", "img_excellent", "img_good", "img_bad",
                "bgm_honjitsumouchoutennnari",
                "se_spawn", "se_perfect", "se_excellent", "se_good", "se_bad",
            ],
        });

        this.sequencer = this.createSequencer(Chart.Charts, 120, 4);
        this.posTable = Common.createNoteGuidePosTable(this.sequencer.bpm);

        this.onLoad.addOnce(this.loadHandler);
    }

    private createSequencer = (charts: number[][], bpm: number, timeBase: number): ChartSequencer => {
        const sequencer = new ChartSequencer(charts, bpm, timeBase);
        sequencer.onStart.add(_ => { /* do nothing */ });
        sequencer.onNote.add(_ => {
            this.asset.getAudioById("se_spawn").play();
            this.createNote();
        });
        sequencer.onFinish.add(_ => {
            this.setTimeout(() => {
                this.gameOver();
                this.onUpdate.add(() => this.effectLayer.append(new PetalEffect(this, this.guide)));
            }, 200);
            if (this.onPointDownCapture.contains(this.waitClickListener)) {
                this.onPointDownCapture.remove(this.waitClickListener);
            }
            this.onPointDownCapture.add(this.addClickListner);
        });
        return sequencer;
    };

    private createNote = (): void => {
        const note = new SakuraNote(this, this.guide, this.sequencer.bpm);
        note.onFailed.addOnce(note => {
            this.bloomLayer.append(new Dispersal(this, note));
            this.asset.getAudioById("se_bad").play();
            this.createRatings(note, Rating.BAD);
        });
        note.onClicked.addOnce(note => {
            let rating: Rating;
            if (withinTimingWindow(Rating.PERFECT, note.ticks)) {
                this.asset.getAudioById("se_perfect").play();
                rating = Rating.PERFECT;
                this.bloomSakura(rating.scoreRate, note);
            } else if (withinTimingWindow(Rating.EXCELLENT, note.ticks)) {
                this.asset.getAudioById("se_excellent").play();
                rating = Rating.EXCELLENT;
                this.bloomSakura(rating.scoreRate);
            } else if (withinTimingWindow(Rating.GOOD, note.ticks)) {
                this.asset.getAudioById("se_good").play();
                rating = Rating.GOOD;
                this.bloomSakura(rating.scoreRate);
            } else {
                this.asset.getAudioById("se_bad").play();
                rating = Rating.BAD;
                this.bloomLayer.append(new Dispersal(this, note));
            }
            //console.log(rating, node.ticks);
            this.createRatings(note, rating);
        });
        this.notesLayer.append(note);
    };

    private bloomSakura = (scoreRate: number, node: g.CommonOffset = this.guide) => {
        this.bloomLayer.append(new BloomEffect(this, node, scoreRate));
        this.bloomLayer.append(new Bloom(this, node, scoreRate));
        this.score.add(scoreRate);
    };

    private createRatings = (node: SakuraNote, ratings: Rating) => {
        const rating = new RatingScore(this, node, ratings);
        this.ratingLayer.append(rating);
    }

    private updateHandler = () => {
        this.sequencer.tick();

        const pos = this.posTable[this.sequencer.ticks % this.sequencer.bpm];
        this.guide.x = pos.x;
        this.guide.y = pos.y;
        this.guide.modified();

        if (this.sequencer.ticks % 3 === 0) {
            this.effectLayer.append(new PetalEffect(this, this.guide));
        }
    };

    private loadHandler = () => {
        this.append(Common.createFloor(this));

        this.effectLayer = new g.E({ scene: this, parent: this, });
        this.notesLayer = new g.E({ scene: this, parent: this, });
        this.bloomLayer = new g.E({ scene: this, parent: this, });
        this.ratingLayer = new g.E({ scene: this, parent: this, });

        this.guide = new NoteGuide(this, this.posTable[0]);
        this.append(this.guide);

        this.font = Common.createDynamicFont();
        this.createHudLayer();

        const start = new StartLabel(this, this.font);
        this.hudLayer.append(start);

        this.createAudioPlayer(start);
    };

    private createHudLayer = (): void => {
        this.hudLayer = new g.E({ scene: this, parent: this });

        this.score = new Score(this, this.font);
        this.hudLayer.append(this.score);

        this.timer = new CountdownTimer(this, this.font, this._timeLimit);
        this.timer.onFinish.add(() => { /* do nothing */ });
        this.timer.start();
        this.hudLayer.append(this.timer);
    };

    private gameOver = (): void => {
        const gameOver = this.createLabel(this.font, "おわり");
        gameOver.x = g.game.width / 2;
        gameOver.y = g.game.height / 2;
        this.hudLayer.append(gameOver);
        this.createCopyright(this.font);

        this.setTimeout(() => this.onUpdate.add(this.gameOverUpdateHandler), 1000);

        if (!this.blackout || (this.blackout && this.blackout.destroyed())) {
            const rank = this.createRank(this.font);
            rank.x = gameOver.x;
            rank.y = gameOver.y + gameOver.height * 2;
            this.hudLayer.append(rank);
        }

        if (!this.blackout?.destroyed()) {
            this.blackout?.destroy();
        }
        if (!this.waitMessage?.destroyed()) {
            this.waitMessage?.destroy();
        }
    };

    private gameOverUpdateHandler = (): void => {
        if (g.game.age % 5 === 0) {
            const resultRate = this.calcResultRate();
            if (g.game.random.generate() <= 1 - resultRate) return;

            const x = g.game.random.generate() * g.game.width * .7 + g.game.width * .15;
            const y = g.game.random.generate() * g.game.height * .7 + g.game.height * .15;
            const scoreRate = Math.floor(resultRate * 2 + 1);
            const bloom = new BloomEffect(this, { x: x, y: y }, scoreRate);
            this.bloomLayer.append(bloom);
        }
    };

    private createCopyright = (font: g.DynamicFont) => {
        const text = "曲: ほんじつもうちょうてんなり (C)PANICPUMPKIN";
        const copyright = this.createLabel(font, text, FontSize.SMALL);
        copyright.x = g.game.width / 2;
        copyright.y = g.game.height - copyright.height * 1.5;
        this.hudLayer.append(copyright);
    };

    private createRank = (font: g.DynamicFont): g.Label => {
        const resultRate = this.calcResultRate()
        let rank = "";
        let msg = "";
        if (resultRate >= 1.0) {
            rank = "SSS";
            msg = "パーフェクト！";
        } else if (resultRate >= 0.95) {
            rank = "SS";
            msg = "超絶満開！";
        } else if (resultRate >= 0.90) {
            rank = "S";
            msg = "超満開！";
        } else if (resultRate >= 0.75) {
            rank = "A";
            msg = "満開！さらに上を目指そう！";
        } else {
            const rate = resultRate / 0.75;
            if (rate >= 0.7) {
                rank = "B";
                msg = `${Math.floor(rate * 10)}分咲き`;
            } else if (rate >= 0.4) {
                rank = "C";
                msg = `${Math.floor(rate * 10)}分咲き`;
            } else if (rate >= 0.1) {
                rank = "D";
                msg = `${Math.floor(rate * 10)}分咲き`;
            } else {
                rank = "E";
                msg = "春はまだ遠い...";
            }
        }
        const rankLabel = this.createLabel(font, `ランク ${rank}`, FontSize.MEDIUM);
        const msgLabel = this.createLabel(font, msg, FontSize.MEDIUM);
        msgLabel.x = rankLabel.width / 2;
        msgLabel.y = rankLabel.height * 2;
        rankLabel.append(msgLabel);
        return rankLabel;
    };

    private calcResultRate = (): number => {
        const allNoteCount = ArrayUtil.extractOneCount(this.sequencer.charts);
        const bloomingRate = (this.score.blooming / allNoteCount) * 0.6;
        const perfectRate = (this.score.perfectCount / allNoteCount) * 0.4;
        // const comboRate = (this.score.maxCombo / allNoteCount) * 0.4;
        //const resultRate = bloomingRate + comboRate;
        const resultRate = bloomingRate + perfectRate;

        // console.log(
        //     "max combo = ", this.score.maxCombo,
        //     " ,blooming = ", this.score.blooming,
        //     " ,allNoteCount = ", allNoteCount,
        //     " ,perfectCount = ", this.score.perfectCount,
        //     " ,perfectRate = ", perfectRate,
        //     " ,bloomingRate = ", bloomingRate,
        //     " ,comboRate = ", comboRate,
        //     " ,resultRate = ", resultRate);
        return resultRate;
    };

    private createLabel = (font: g.DynamicFont, text: string, fontSize?: number) => new g.Label({
        scene: this,
        text: text,
        font: font,
        fontSize: fontSize ?? font.size,
        anchorX: .5,
        anchorY: .5,
    });

    private createAudioPlayer = (startLabel: StartLabel): void => {
        const audiAsset = this.asset.getAudioById("bgm_honjitsumouchoutennnari");
        const player = new g.MusicAudioSystem({
            id: audiAsset.id,
            resourceFactory: g.game.resourceFactory,
            volume: this.volume,
        }).createPlayer();

        player.onPlay.add((_ev: g.AudioPlayerEvent) => {
            startLabel.show();
            startLabel.start(this.sequencer.bpm / 2);

            this.onUpdate.add(this.updateHandler);

            this.onPointDownCapture.add(this.clickListener);
            this.addKyeboradListener();
        });
        player.onStop.add((ev: g.AudioPlayerEvent) => ev.player.stop());

        if (this.params.isAlreadyClicked) {
            player.play(audiAsset);
        } else {
            startLabel.hide();
            this.waitScreenClick(player, audiAsset);
        }
    };

    private waitScreenClick = (player: g.AudioPlayer, asset: g.AudioAsset) => {
        this.onPointDownCapture.add(this.waitClickListener);
        this.waitMessage = this.createLabel(Common.createDynamicFont(), "画面をクリックしてスタート！");
        this.waitMessage.x = g.game.width / 2;
        this.waitMessage.y = g.game.height / 2;

        this.blackout = new Blackout(this);
        this.blackout.onStartGame.add(_ => {
            this.waitMessage.destroy();
            this.onPointDownCapture.remove(this.waitClickListener);
            player.play(asset);
        });
        this.hudLayer.append(this.blackout);
        this.hudLayer.append(this.waitMessage);
    };

    private waitClickListener = (): void => { this.blackout.close(); };

    private clickListener = (): void => {
        const notes = this.notesLayer.children;
        if (!notes) return;

        for (const note of notes) {
            if ((note instanceof SakuraNote) && note.judge()) {
                return;
            }
        }
    };

    private addClickListner = (): void => {
        this.asset.getAudioById("se_spawn").play();
        this.guide.beat();
        this.bloomLayer.append(new BloomEffect(this, this.guide, Rating.PERFECT.scoreRate));
    };

    private addKyeboradListener = (): void => {
        const lowerCase = "z", upperCase = "Z";
        let isKeyDown: boolean = false;

        if (typeof window !== "undefined") {
            window.addEventListener('keydown', ev => {
                if (ev.key === lowerCase || ev.key === upperCase) {
                    if (isKeyDown) return;

                    isKeyDown = true;
                    this.clickListener();

                    if (this.sequencer.isFinished) {
                        this.addClickListner();
                    }
                }
            });
            window.addEventListener('keyup', ev => {
                if (ev.key === lowerCase || ev.key === upperCase) {
                    isKeyDown = false;
                }
            });
        }
    };
}