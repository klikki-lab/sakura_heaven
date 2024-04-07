import { FontSize } from "../common/fontSize";
import { GameMainParameterObject } from "../parameterObject";
import { TitleSceneTimer } from "./titleSceneTimer";
import { BeatLabel } from "../common/beatLabel";
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
import { HorizontalRadioButton } from "../common/horizontalRadioButton";

export interface GameProps {
    isAlreadyClicked: boolean;
    musicVolume: number;
    soundVolume: number;
}

export class TitleScene extends g.Scene {

    private static readonly MIN_VOLUME = 0.5;
    private static readonly SE_VOLUME_RATE = 0.8;

    onFinish: g.Trigger<GameProps> = new g.Trigger();

    private sequencer: ChartSequencer;
    private posTable: g.CommonOffset[] = [];
    private guide: NoteGuide;
    private titleLabel: BeatLabel;
    private messageLabel: g.Label;
    private timingLabel: g.Label;
    private startButton: Button;
    private radioButton: HorizontalRadioButton;
    private effectLayer: g.E;
    private notesLayer: g.E;
    private bloomLayer: g.E;
    private keyEvent: KeyEvent;

    private isButtonClicked: boolean = false;
    private isClicked: boolean = false;
    private isFinished: boolean = false;

    constructor(_param: GameMainParameterObject, private _timeLimit: number, private _volume: number) {
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
            this.playSE(rating.assetId.sound);
        });
        this.notesLayer.append(note);

        const failed = (): void => {
            this.bloomLayer.append(new Dispersal(this, note));
        };
    };

    private playSE = (assetId: string): void => {
        if (this.isClicked || this.isButtonClicked) {
            this.asset.getAudioById(assetId).play().changeVolume(this._volume * TitleScene.SE_VOLUME_RATE);
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

        this.titleLabel = new BeatLabel(this, Common.createDynamicFont(FontSize.XL), "SAKURA HEAVEN");
        this.titleLabel.x = g.game.width / 2;
        this.titleLabel.y = this.titleLabel.height * 1.5;
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
        this.startButton.x = g.game.width - this.startButton.width * 0.65;
        this.startButton.y = g.game.height - this.startButton.height * 1.25;
        this.startButton.modified();
        this.startButton.onClickDown.add(_button => {
            this.isButtonClicked = true;
            this.playSE("se_excellent");
        });
        this.startButton.onClicked.add(_button => {
            timer.stop();
            this.setTimeout(() => this.finishScene(true), 100);
        });
        this.append(this.startButton);


        const volume = new g.Label({
            scene: this,
            font: font,
            fontSize: FontSize.SMALL,
            text: "音量",
            anchorX: .5,
            anchorY: .5,
        });
        volume.x = this.startButton.x - (this.startButton.width - volume.width) / 2;
        volume.y = this.startButton.y - this.startButton.height * 2;
        this.append(volume);

        const radioButtonFont = Common.createDynamicFont(FontSize.TINY, "sans-serif", "white");
        const texts = ["もっと小さい", "小さい", "大きい"];
        this.radioButton = new HorizontalRadioButton(this, radioButtonFont, texts, 2);
        this.radioButton.x = g.game.width - this.radioButton.width * 0.925;
        this.radioButton.y = this.startButton.y - this.radioButton.height * 3;
        this.radioButton.modified();
        this.radioButton.onClicked.add(_button => {
            this._volume = this.getVolume();
            if (!this.isButtonClicked) {
                this.isButtonClicked = true;
            }
            this.playSE("se_good");
        });
        this.append(this.radioButton);

        this.guide = new NoteGuide(this, this.posTable[0]);
        this.append(this.guide);

        this.keyEvent = new KeyEvent();
        this.keyEvent.addListener();
        this.keyEvent.onKeyDown.add(() => this.clickListener());
        this.onPointDownCapture.add(this.clickListener);
    };

    private getVolume = (): number => this.radioButton.getSelectedIndex() * 0.25 + TitleScene.MIN_VOLUME;

    private finishScene = (isClicked: boolean): void => {
        if (!this.isFinished) {
            this.isFinished = true;
            this.keyEvent?.removeListener();

            this._volume = this.getVolume();
            this.onFinish.fire({
                isAlreadyClicked: isClicked,
                musicVolume: this._volume,
                soundVolume: this._volume * TitleScene.SE_VOLUME_RATE,
            });
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

    private clickListener = (ev?: g.PointDownEvent): void => {
        if (ev?.target instanceof g.FilledRect) return;

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