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
import { GameProps } from "../title_scene/titleScene";
import { Common } from "../common/common";
import { Blackout } from "./blackout";
import { KeyEvent } from "../common/keyEvent";
import { BeatLabel } from "../common/beatLabel";
import { Border } from "./sakura/border";

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
    private waitingMessage: g.Label;
    private keyEvent: KeyEvent;

    constructor(_param: GameMainParameterObject, private timeLimit: number, private props: GameProps) {
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
        sequencer.onStart.add(_ => {
            if (this.props.isAlreadyClicked) {
                this.timer.start();
            }
        });
        sequencer.onNote.add(_ => {
            this.playSoundEffect("se_spawn");
            this.appendNote();
        });
        sequencer.onFinish.add(_ => {
            this.setTimeout(() => {
                this.gameOver();
                this.onUpdate.add(() => this.effectLayer.append(new PetalEffect(this, this.guide)));
                this.onPointDownCapture.add(addClickListner);
                this.keyEvent?.onKeyDown.add(addClickListner);
            }, 750);
            if (this.onPointDownCapture.contains(this.waitClickListener)) {
                this.onPointDownCapture.remove(this.waitClickListener);
            }
        });
        const addClickListner = (): void => {
            this.playSoundEffect("se_spawn");
            this.guide.beat();
            this.bloomLayer.append(new BloomEffect(this, this.guide, Rating.PERFECT.scoreRate));
        };
        return sequencer;
    };

    private appendNote = (): void => {
        const note = new SakuraNote(this, this.guide, this.sequencer.bpm);
        note.onFailed.addOnce(_note => failed());
        note.onClicked.addOnce(note => {
            const rating: Rating = withinTimingWindow(note.ticks);
            switch (rating) {
                case Rating.PERFECT:
                case Rating.SEMI_PERFECT:
                    appendBloomSakura(rating.scoreRate, note);
                    break;
                case Rating.EXCELLENT:
                case Rating.GOOD:
                    appendBloomSakura(rating.scoreRate, this.guide);
                    break;
                case Rating.BAD:
                    failed();
                    this.bloomLayer.append(new Border(this, this.guide));
                    return;
            }
            result(rating);
        });
        this.notesLayer.append(note);

        const appendBloomSakura = (scoreRate: number, target: g.CommonOffset): void => {
            this.bloomLayer.append(new BloomEffect(this, target, scoreRate));
            this.bloomLayer.append(new Bloom(this, target, scoreRate));
        };
        const result = (rating: Rating) => {
            this.score.add(rating);
            this.playSoundEffect(rating.assetId.sound);
            this.ratingLayer.append(new RatingScore(this, note, rating));
        };
        const failed = () => {
            this.bloomLayer.append(new Dispersal(this, note));
            result(Rating.BAD);
        };
    };

    private updateHandler = (): void => {
        this.sequencer.tick();

        const pos = this.posTable[this.sequencer.ticks % this.sequencer.bpm];
        this.guide.x = pos.x;
        this.guide.y = pos.y;
        this.guide.modified();

        if (this.sequencer.ticks % 3 === 0) {
            this.effectLayer.append(new PetalEffect(this, this.guide));
        }
    };

    private loadHandler = (): void => {
        this.append(Common.createFloor(this));

        this.effectLayer = new g.E({ scene: this, parent: this, });
        this.notesLayer = new g.E({ scene: this, parent: this, });
        this.bloomLayer = new g.E({ scene: this, parent: this, });
        this.ratingLayer = new g.E({ scene: this, parent: this, });

        this.guide = new NoteGuide(this, this.posTable[0]);
        this.append(this.guide);

        this.font = Common.createDynamicFont();
        this.appendHudLayer();

        const startLabel = new BeatLabel(this, this.font, "スタート！");
        startLabel.moveTo(g.game.width / 2, g.game.height / 2);
        this.hudLayer.append(startLabel);
        this.createAudioPlayer(startLabel);
    };

    private appendHudLayer = (): void => {
        this.hudLayer = new g.E({ scene: this, parent: this });

        this.score = new Score(this, this.font);
        this.hudLayer.append(this.score);

        const timeLimit = this.timeLimit - (this.props.isAlreadyClicked ? 5 : 0);
        this.timer = new CountdownTimer(this, this.font, timeLimit);
        this.timer.onFinish.add(() => { /* do nothing */ });
        if (!this.props.isAlreadyClicked) {
            this.timer.start();
        }
        this.hudLayer.append(this.timer);
    };

    private gameOver = (): void => {
        const gameOver = new BeatLabel(this, this.font, "おわり", this.sequencer.ticks);
        gameOver.moveTo(g.game.width / 2, g.game.height / 2);
        gameOver.start(this.sequencer.bpm / 2);
        this.hudLayer.append(gameOver);
        this.appendCopyright(this.font);

        const resultRate = this.calcResultRate();
        const gameOverUpdateHandler = (): void => {
            if (g.game.age % 5 === 0) {
                if (g.game.random.generate() <= 1 - resultRate) return;

                const x = g.game.random.generate() * g.game.width * .7 + g.game.width * .15;
                const y = g.game.random.generate() * g.game.height * .7 + g.game.height * .15;
                const scoreRate = Math.floor(resultRate * 2 + 1);
                const bloom = new BloomEffect(this, { x: x, y: y }, scoreRate, "img_sakura");
                this.bloomLayer.append(bloom);
            }
        };
        this.setTimeout(() => this.onUpdate.add(gameOverUpdateHandler), 1000);

        if (!this.blackout || (this.blackout && this.blackout.destroyed())) {
            const rank = this.createRank(this.font, resultRate);
            rank.x = gameOver.x;
            rank.y = gameOver.y + gameOver.height * 2;
            this.hudLayer.append(rank);
        }

        if (this.blackout && !this.blackout.destroyed()) {
            this.blackout.destroy();
        }
        if (this.waitingMessage && !this.waitingMessage.destroyed()) {
            this.waitingMessage.destroy();
        }
    };

    private appendCopyright = (font: g.DynamicFont): void => {
        const text = "曲: ほんじつもうちょうてんなり (C)PANICPUMPKIN";
        const copyright = this.createLabel(font, text, FontSize.SMALL);
        copyright.x = g.game.width / 2;
        copyright.y = g.game.height - copyright.height * 1.5;
        this.hudLayer.append(copyright);
    };

    private createRank = (font: g.DynamicFont, resultRate: number): g.Label => {
        let rank = "";
        let msg = "";
        if (resultRate >= 0.9999999999999999) {
            if (this.score.isAbsolutelyPerfect()) {
                rank = "神";
                msg = "You are the SAKURA GOD!!!";
            } else {
                rank = "SSS";
                msg = "パーフェクト！";
            }
        } else if (resultRate >= 0.95) {
            rank = "SS";
            msg = "超絶満開！";
        } else if (resultRate >= 0.90) {
            rank = "S";
            msg = "超満開！";
        } else if (resultRate >= 0.80) {
            rank = "A";
            msg = "満開！さらに上を目指そう！";
        } else {
            const rate = resultRate / 0.80;
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
        const allNoteCount = Chart.extractNoteCount(this.sequencer.charts);
        const bloomingRate = (this.score.blooming / allNoteCount) * 0.6;
        const perfectRate = (this.score.perfectCount / allNoteCount) * 0.3;
        const comboRate = (this.score.maxCombo / allNoteCount) * 0.1;
        const resultRate = bloomingRate + perfectRate + comboRate;
        // console.log(
        //     " blooming = ", this.score.blooming,
        //     " ,max combo = ", this.score.maxCombo,
        //     " ,allNoteCount = ", allNoteCount,
        //     " ,bloomingRate = ", bloomingRate,
        //     " ,perfectRate = ", perfectRate,
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

    private playSoundEffect = (assetId: string): void => {
        this.asset.getAudioById(assetId).play().changeVolume(this.props.soundVolume);
    };

    private createAudioPlayer = (startLabel: BeatLabel): void => {
        const audiAsset = this.asset.getAudioById("bgm_honjitsumouchoutennnari");
        const audioPlayer = new g.MusicAudioSystem({
            id: audiAsset.id,
            resourceFactory: g.game.resourceFactory,
            volume: this.props.musicVolume,
        }).createPlayer();

        audioPlayer.onPlay.add((_ev: g.AudioPlayerEvent) => {
            startLabel.show();
            startLabel.start(this.sequencer.bpm / 2);
            this.setTimeout(() => startLabel.destroy(), 1000 * 4);

            this.onUpdate.add(this.updateHandler);

            this.onPointDownCapture.add(this.clickListener);
            this.keyEvent = new KeyEvent();
            this.keyEvent.addListener();
            this.keyEvent.onKeyDown.add(this.clickListener);
        });
        audioPlayer.onStop.add((ev: g.AudioPlayerEvent) => ev.player.stop());

        if (this.props.isAlreadyClicked) {
            audioPlayer.play(audiAsset);
        } else {
            startLabel.hide();
            this.waitScreenClick(audioPlayer, audiAsset);
        }
    };

    private clickListener = (): void => {
        const notes = this.notesLayer.children;
        if (!notes) return;

        for (const note of notes) {
            if ((note instanceof SakuraNote) && note.judge()) {
                return;
            }
        }
    };

    private waitScreenClick = (player: g.AudioPlayer, asset: g.AudioAsset): void => {
        this.onPointDownCapture.add(this.waitClickListener);
        this.waitingMessage = this.createLabel(Common.createDynamicFont(), "画面をクリックしてスタート！");
        this.waitingMessage.x = g.game.width / 2;
        this.waitingMessage.y = g.game.height / 2;

        this.blackout = new Blackout(this);
        this.blackout.onStartGame.add(_ => {
            this.waitingMessage.destroy();
            this.onPointDownCapture.remove(this.waitClickListener);
            player.play(asset);
        });
        this.hudLayer.append(this.blackout);
        this.hudLayer.append(this.waitingMessage);
    };

    private waitClickListener = (): void => { this.blackout.close(); };
}