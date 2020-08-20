import Avocado from "./engine/GameEngine.js";

window.onload = function() {
  (new Game()).start();
};

export default class Game {
  constructor(options = {}) {
    this.avo = new Avocado({
      width: 1000,
      height: 1000,
      bgColor: "#000",
      ...options
    });

    // Debug
    // window.avo = this.avo;
    // this.engine.setProd();
  }

  start() {
    this.avo.load().then(() => {
      
      // {Init Code}
      
      this.avo.onUpdate(() => {
        
        // {Loop Code}

      });
    });
  }

}
