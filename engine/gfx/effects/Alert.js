import Text from "../Text.js";

export default class Alert {
  alpha = 0;
  count = 0;
  alphaDir = 0;
  maxAlpha = 0.4;
  speed = 1/90;
  hide = true;
  z = 50;
  
  constructor(engine, str = null, sound = null) {
    this.engine = engine;
    this.width = engine.window.width;
    this.height = engine.window.height;
    this.sound = sound;

    if ( str ) {
      this.warnText = new Text("Warning!!", this.width/2, 250, 
      { 
        fontWeight: "bold",
        fontSize: 100,
        fontColor: "#733",
        center: true,
      });
    }
  }

  activate(count) {
    this.count = count;
    this.alphaDir = this.speed;
    this.hide = false;

    if ( this.sound ) {
      this.engine.sounds.play(this.sound);
    }
  }

  update() {
    this.alpha += this.alphaDir;
    if ( this.alpha > this.maxAlpha ) {
      this.alpha = this.maxAlpha;
      this.alphaDir = -this.speed;
    } else if (this.alpha < 0) {
      this.alpha = 0;
      this.alphaDir = this.speed;
      this.count--;
    }

    if ( this.count === 0) {
      this.alphaDir = 0;
      this.hide = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#f00";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = this.alpha * (1/this.maxAlpha);
    if ( this.warnText ) {
      this.warnText.draw(ctx);
    }
    ctx.restore();
  }
}