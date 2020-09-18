import Avocado from "./engine/GameEngine.js";
import Text from "./gfx/Text.js";

window.onload = function() {
  (new Game({mobileStretch: false})).start();
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
    window.avo = this.avo;
    // this.engine.setProd();
  }

  start() {
    this.names = {};
    var listener = msg => {
      if ( !this.names[msg.from] ) {
        this.names[msg.from] = {
          name: msg.from,
          text: new Text(msg.from, -300, -300, {fontColor: "yellow"}),
        }
        this.avo.register(this.names[msg.from].text);
      }
      var { text } = this.names[msg.from];
      console.log(msg);
      text.x = msg.body.x;
      text.y = msg.body.y;
    };

    this.avo.net.connect(listener);
    this.avo.net.auth(this.avo.params.name || "anonymous");
    this.avo.net.subscribe('netExample');

    var waitForSend = 0;
    this.avo.onMouseMove(evt => {
      if ( waitForSend === 0 ) {
        this.avo.net.send('netExample', {
          x: evt.pos.x,
          y: evt.pos.y,
        });
        waitForSend = 0.05;
      }
    });

    this.avo.onUpdate(() => {
      waitForSend = Math.max(waitForSend - 1/60, 0);
    });

    this.avo.load().then(() => {
      
    });
  }

}
