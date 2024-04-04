import { FontSize } from "./fontSize";

export module Common {

    export const createFloor = (scene: g.Scene): g.FilledRect => {
        const floor = new g.FilledRect({
            scene: scene,
            width: g.game.width,
            height: g.game.height,
            cssColor: "#2a1010",
        });
        const size = 80;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 16; j++) {
                if ((i + j) % 2 === 0) continue;
                new g.FilledRect({
                    scene: scene,
                    parent: floor,
                    width: size,
                    height: size,
                    cssColor: "#3a2020",
                    x: j * size,
                    y: i * size,
                });
            }
        }
        return floor;
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