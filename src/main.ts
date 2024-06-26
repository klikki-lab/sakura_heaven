import { GameScene } from "./game_scene/gameScene";
import { CustomLoadingScene } from "./loading_scene/loadingScene";
import { GameMainParameterObject } from "./parameterObject";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    // g.game.audio.music.volume = 0.5;
    // g.game.audio.sound.volume = 0.25;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(param, 10, 0.5);
    titleScene.onFinish.add(props => {
        g.game.replaceScene(new GameScene(param, 70, props));
    });
    g.game.pushScene(titleScene);
}
