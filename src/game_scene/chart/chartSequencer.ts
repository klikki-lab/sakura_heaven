import { Chart } from "./chart";

export class ChartSequencer {

    private static readonly MAX_BEATS = 8;

    onStart: g.Trigger<void> = new g.Trigger();
    onNote: g.Trigger<void> = new g.Trigger();
    onTiming: g.Trigger<void> = new g.Trigger();
    onFinish: g.Trigger<void> = new g.Trigger();

    private _ticks: number = 0;
    private readonly _beatPeriod: number = 0;
    private measure: number = 0;
    private note: number = 0;
    private _isFinished: boolean = false;

    constructor(private _charts: number[][], private _bpm: number, timeBase: number) {
        this._beatPeriod = Math.floor(g.game.fps / timeBase);
    }

    tick = (): void => {
        if (this.isFinished) {
            this._ticks++;
            return;
        }

        if (this._ticks % this._beatPeriod === 0) {
            const note = this._charts[this.measure][this.note];
            switch (note) {
                case Chart.State.START:
                    this.onStart.fire();
                    break;
                case Chart.State.NOTE:
                    this.onNote.fire();
                    break;
                case Chart.State.REST:
                    break;
                case Chart.State.TIMING:
                    this.onTiming.fire();
                    break;
                case Chart.State.LOOP:
                    this.measure = 0;
                    this.note = 0;
                    this._ticks++;
                    return;
                case Chart.State.EOC:
                    this.finish();
                    return;
            }

            this.note++;
            if (this._charts[this.measure].length <= this.note) {
                this.measure++;
                this.note = 0;

                if (this._charts.length <= this.measure) {
                    this.finish();
                }
            }
        }
        this._ticks++;
    }

    private finish = (): void => {
        this.measure = 0;
        this.note = 0;
        this._isFinished = true;
        this.onFinish.fire();
    };

    isStarted = (): boolean => this._ticks > 0;

    get bpm(): number { return this._bpm; }

    get ticks(): number { return this._ticks; }

    get isFinished(): boolean { return this._isFinished; }

    get charts(): number[][] { return this._charts; }
}