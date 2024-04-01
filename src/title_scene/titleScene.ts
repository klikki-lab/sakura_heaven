import { FontSize } from "../common/fontSize";
import { GameMainParameterObject } from "../parameterObject";
import { TitleSceneTimer } from "./titleSceneTimer";
import { Title } from "./title";
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
import { Button } from "./button";

export interface TitleSceneParams {
    isAlreadyClicked: boolean;
}

export class TitleScene extends g.Scene {

    onFinish: g.Trigger<TitleSceneParams> = new g.Trigger();

    private sequencer: ChartSequencer;
    private posTable: g.CommonOffset[] = [];
    private guide: NoteGuide;
    private title: Title;
    private messageLabel: g.Label;
    private timingLabel: g.Label;
    private startButton: Button;
    private effectLayer: g.E;
    private notesLayer: g.E;
    private bloomLayer: g.E;

    private isClicked: boolean = false;

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
        // sequencer.onStart.add(_ => {   });
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
        sequencer.onFinish.add(_ => {
            // this.onUpdate.add(() => this.effectLayer.append(new PetalEffect(this, this.conductor)));
            // this.onPointDownCapture.add(_ev => this.addClickListner());
        });
        return sequencer;
    };

    private createNote = () => {
        const note = new SakuraNote(this, this.guide, this.sequencer.bpm);
        note.onFailed.addOnce(_note => failed());
        note.onClicked.addOnce(note => {
            let message = "";
            let assetId = "";
            if (withinTimingWindow(Rating.PERFECT, note.ticks)) {
                message = "リズムカンペキ！";
                assetId = "se_perfect";
                this.bloomSakura(Rating.PERFECT.scoreRate, note);
            } else if (withinTimingWindow(Rating.EXCELLENT, note.ticks)) {
                message = "エクセレント！";
                assetId = "se_excellent";
                this.bloomSakura(Rating.EXCELLENT.scoreRate, note);
            } else if (withinTimingWindow(Rating.GOOD, note.ticks)) {
                message = "なかなかのリズムだ！";
                assetId = "se_good";
                this.bloomSakura(Rating.GOOD.scoreRate, note);
            } else {
                failed();
                return;
            }
            this.playSE(assetId);
            this.showMessage(message);
        });
        this.notesLayer.append(note);

        const failed = (): void => {
            // this.playSE("se_bad"); 
            this.bloomLayer.append(new Dispersal(this, note));
        };
    };

    private playSE = (assetId: string): void => {
        if (this.isClicked) {
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

    private bloomSakura = (scoreRate: number, node: g.CommonOffset = this.guide) => {
        this.bloomLayer.append(new BloomEffect(this, node, scoreRate));
        this.bloomLayer.append(new Bloom(this, node, scoreRate));
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

        this.title = new Title(this, Common.createDynamicFont(FontSize.XL));
        this.title.start(60);
        this.append(this.title);

        const font = Common.createDynamicFont(FontSize.MEDIUM);

        this.timingLabel = this.createTimingLabel(font);
        this.append(this.timingLabel);

        this.messageLabel = this.createMessageLabel(font);
        this.append(this.messageLabel);

        const buttonFont = Common.createDynamicFont(FontSize.MEDIUM, "sans-serif", "white");
        this.startButton = new Button(this, buttonFont, "今すぐスタート");
        this.startButton.x = g.game.width - this.startButton.width * 0.75;
        this.startButton.y = g.game.height - this.startButton.height * 0.75;
        this.startButton.modified();
        this.startButton.onClick.add(_button => {
            this.isClicked = true;
            this.playSE("se_spawn");
        });
        this.startButton.onClicked.add(_button => this.finishTitleScene(true));
        this.append(this.startButton);

        const timer = this.createCountdownTimer(font);
        this.append(timer);

        this.guide = new NoteGuide(this, this.posTable[0]);
        this.append(this.guide);

        // this.onUpdate.add(this.updateHandler);
        this.onPointDownCapture.add((ev: g.PointDownEvent) => {
            if (ev.target !== this.startButton) {
                this.clickListener();
            }
        });
        this.addKyeboradListener();
    };

    private finishTitleScene = (isClicked: boolean): void => {
        this.onFinish.fire({ isAlreadyClicked: isClicked });
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
        timer.onFinish.addOnce(() => this.finishTitleScene(this.isClicked));
        timer.start();
        return timer;
    };

    private clickListener = (): void => {
        if (!this.isClicked) {
            this.isClicked = true;
            this.onUpdate.add(this.updateHandler);
            this.messageLabel.text = "クリックのタイミングをリズムで覚えよう！";
            this.messageLabel.invalidate();
        }

        const notes = this.notesLayer.children;
        if (!notes) return;

        for (const note of notes) {
            if ((note instanceof SakuraNote) && note.judge()) {
                return;
            }
        }
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