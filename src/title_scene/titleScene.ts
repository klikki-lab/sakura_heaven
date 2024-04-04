import { FontSize } from "../common/fontSize";
import { GameMainParameterObject } from "../parameterObject";
import { TitleSceneTimer } from "./titleSceneTimer";
import { TitleLabel } from "./titleLabel";
import { NoteGuide } from "../game_scene/sakura/noteGuide";
import { ChartSequencer } from "../game_scene/chart/chartSequencer";
import { Chart } from "../game_scene/chart/chart";
import { Common } from "../common/common";
import { PetalEffect } from "../game_scene/effect/petalEffect";
import { SakuraNote } from "../game_scene/sakura/sakuraNote";
import { Dispersal } from "../game_scene/sakura/dispersal";
import { Rating, withinTimingWindow } from "../game_scene/effect/ratingScore";
import { BloomEffect } from "../game_scene/effect/bloomEffect";
import { Bloom } from "../game_scene/sakura/bloom";
import { Button } from "../common/button";
import { KeyEvent } from "../common/keyEvent";

export interface TitleSceneParams {
    isAlreadyClicked: boolean;
}

export class TitleScene extends g.Scene {

    onFinish: g.Trigger<TitleSceneParams> = new g.Trigger();

    private sequencer: ChartSequencer;
    private posTable: g.CommonOffset[] = [];
    private guide: NoteGuide;
    private titleLabel: TitleLabel;
    private messageLabel: g.Label;
    private timingLabel: g.Label;
    private startButton: Button;
    private effectLayer: g.E;
    private notesLayer: g.E;
    private bloomLayer: g.E;
    private keyEvent: KeyEvent;

    private isButtonClicked: boolean = false;
    private isClicked: boolean = false;
    private isFinished: boolean = false;

    constructor(_param: GameMainParameterObject, private _timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_sakura", "img_sakura_border", "img_sakura_no_gradation", "img_petal",
                "se_spawn", "se_perfect", "se_excellent", "se_good", "se_bad",
            ],
        });

        const charts = [[1, 0, 0, 0, 1, 0, 0, 0], [2, 0, 0, 0, 2, 0, 0, Chart.State.LOOP]];
        this.sequencer = this.createSequencer(charts, 120, 4);
        this.posTable = Common.createNoteGuidePosTable(this.sequencer.bpm, 0.75);

        this.onLoad.addOnce(this.loadHandler);
    }

    private createSequencer = (charts: number[][], bpm: number, timeBase: number): ChartSequencer => {
        const sequencer = new ChartSequencer(charts, bpm, timeBase);
        sequencer.onNote.add(_ => {
            this.playSE("se_spawn");
            this.createNote();
            this.guide.beat();
        });
        sequencer.onTiming.add(_ => {
            this.timingLabel.x = this.guide.x;
            this.timingLabel.y = this.guide.y;
            this.timingLabel.modified();
            this.timingLabel.show();
            this.setTimeout(() => {
                this.timingLabel.hide();
            }, 250);
        });
        return sequencer;
    };

    private createNote = () => {
        const note = new SakuraNote(this, this.guide, this.sequencer.bpm);
        note.onFailed.addOnce(_note => failed());
        note.onClicked.addOnce(note => {
            const rating: Rating = withinTimingWindow(note.ticks);
            switch (rating) {
                case Rating.PERFECT:
                case Rating.SEMI_PERFECT:
                    this.bloomSakura(rating.scoreRate, note);
                    this.showMessage("リズムカンペキ！");
                    break;
                case Rating.EXCELLENT:
                    this.bloomSakura(rating.scoreRate, this.guide);
                    this.showMessage("エクセレント！");
                    break;
                case Rating.GOOD:
                    this.bloomSakura(rating.scoreRate, this.guide);
                    this.showMessage("イイ感じ！");
                    break;
                case Rating.BAD:
                    failed();
                    return;
            }
            this.playSE(rating.audioId);
        });
        this.notesLayer.append(note);

        const failed = (): void => {
            // this.playSE("se_bad"); 
            this.bloomLayer.append(new Dispersal(this, note));
        };
    };

    private playSE = (assetId: string): void => {
        if (this.isClicked || this.isButtonClicked) {
            this.asset.getAudioById(assetId).play();
        }
    };

    private showMessage = (message: string) => {
        if (!this.isClicked) return;

        this.messageLabel.text = message;
        this.messageLabel.invalidate();
        this.messageLabel.show();
        this.setTimeout(() => {
            this.messageLabel.hide();
        }, 750);
    };

    private bloomSakura = (scoreRate: number, target: g.CommonOffset) => {
        this.bloomLayer.append(new BloomEffect(this, target, scoreRate));
        this.bloomLayer.append(new Bloom(this, target, scoreRate));
    };

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

        this.titleLabel = new TitleLabel(this, Common.createDynamicFont(FontSize.XL));
        this.titleLabel.start(60);
        this.append(this.titleLabel);

        const font = Common.createDynamicFont(FontSize.MEDIUM);

        this.timingLabel = this.createTimingLabel(font);
        this.append(this.timingLabel);

        this.messageLabel = this.createMessageLabel(font);
        this.append(this.messageLabel);

        const timer = this.createCountdownTimer(font);
        this.append(timer);

        const buttonFont = Common.createDynamicFont(FontSize.MEDIUM, "sans-serif", "white");
        this.startButton = new Button(this, buttonFont, "今すぐはじめる");
        this.startButton.x = g.game.width - this.startButton.width * 0.75;
        this.startButton.y = g.game.height - this.startButton.height * 0.75;
        this.startButton.modified();
        this.startButton.onClickDown.add(_button => {
            this.isButtonClicked = true;
            this.playSE("se_good");
        });
        this.startButton.onClicked.add(_button => {
            timer.stop();
            this.setTimeout(() => this.finishScene(true), 100);
        });
        this.append(this.startButton);

        this.guide = new NoteGuide(this, this.posTable[0]);
        this.append(this.guide);

        this.onPointDownCapture.add((ev: g.PointDownEvent) => {
            if (ev.target !== this.startButton) {
                this.clickListener();
                this.keyEvent = new KeyEvent();
                this.keyEvent.addListener();
                this.keyEvent.onKeyDown.add(this.clickListener);
            }
        });
    };

    private finishScene = (isClicked: boolean): void => {
        if (!this.isFinished) {
            this.isFinished = true;
            this.keyEvent?.removeListener();
            this.onFinish.fire({ isAlreadyClicked: isClicked });
        }
    };

    private createMessageLabel = (font: g.DynamicFont): g.Label => {
        const message = new g.Label({
            scene: this,
            font: font,
            text: "クリックしてネ！",
            anchorX: .5,
            anchorY: .5,
            x: g.game.width / 2,
            y: g.game.height / 2,
        });
        return message;
    };

    private createTimingLabel = (font: g.DynamicFont): g.Label => new g.Label({
        scene: this,
        font: font,
        text: "クリック！",
        anchorX: .5,
        anchorY: .5,
        hidden: true,
    });

    private createCountdownTimer = (font: g.DynamicFont): TitleSceneTimer => {
        const timer = new TitleSceneTimer(this, font, this._timeLimit);
        timer.onFinish.addOnce(() => this.finishScene(this.isClicked || this.isButtonClicked));
        timer.start();
        return timer;
    };

    private clickListener = (): void => {
        if (!this.isClicked) {
            this.isClicked = true;
            this.onUpdate.add(this.updateHandler);
            this.messageLabel.text = "クリックのタイミングを覚えよう！";
            this.messageLabel.invalidate();
            this.titleLabel.restart();
        }

        const notes = this.notesLayer.children;
        if (!notes) return;

        for (const note of notes) {
            if ((note instanceof SakuraNote) && note.judge()) {
                return;
            }
        }
    };
}