import { Common } from "../common/common";

export class CustomLoadingScene extends g.LoadingScene {

    constructor() {
        super({ game: g.game, });

        this.append(Common.createFloor(this));
    }
}