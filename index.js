import GameEngine from "./engine/GameEngine.js";

window.onload = function() {
  (new Game()).start();
};

export default class Game {
  constructor(options = {}) {
    this.engine = new GameEngine({
      width: 500,
      height: 500,
      bgColor: "#000",
      ...options
    });

    // Debug
    // window.engine = this.engine;
    // this.engine.setProd();
  }

  start() {
    this.engine.load().then(() => {
    });
  }

}