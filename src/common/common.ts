import { ChartSequencer } from "../game_scene/chart/chartSequencer";
import { FontSize } from "./fontSize";

export module Common {

    export const createFloor = (scene: g.Scene): g.E => {
        const layer = new g.E({ scene: scene });
        const size = 80;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 16; j++) {
                new g.FilledRect({
                    scene: scene,
                    parent: layer,
                    width: size,
                    height: size,
                    cssColor: ((i + j) % 2 === 0) ? "#2a1010" : "#3a2020",
                    x: j * size,
                    y: i * size,
                });
            }
        }
        return layer;
    };

    export const createNoteGuidePosTable = (bpm: number, radiusRate: number = 1): g.CommonOffset[] => {
        const table: g.CommonOffset[] = [];
        const offsetAngle = Math.PI / 2;
        for (let i = 0; i < bpm; i++) {
            const angle = 2 * Math.PI * (i / bpm) - offsetAngle;
            const radius = g.game.width * 0.15;
            const x = g.game.width / 2 + Math.cos(angle) * radius * radiusRate;
            const y = g.game.height / 2 + Math.sin(angle) * radius * radiusRate;
            table.push({ x: x, y: y });
        }
        return table;
    };

    export const createDynamicFont = (
        size: number = FontSize.LARGE,
        fontFamily: "sans-serif" | "serif" | "monospace" = "sans-serif",
        fontColor: string = "#ffaaaa",
        strokeColor: string = "black") => new g.DynamicFont({
            game: g.game,
            fontFamily: fontFamily,
            fontColor: fontColor,
            fontWeight: "bold",
            size: size,
            strokeColor: strokeColor,
            strokeWidth: size / 6,
        });
}