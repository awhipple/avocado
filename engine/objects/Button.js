import { BoundingRect } from "../GameMath.js";

export default class Button {
  hover = false;
  z = 100;

  constructor(engine, img, x, y, scale) {
    this.engine = engine;
    this.img = img;
    this.x = x;
    this.y = y;
    this.scale = scale;
   
    engine.onMouseMove(event => {
      if (event.pos.x > this.x-this.img.width*this.scale/2 &&
          event.pos.x < this.x+this.img.width*this.scale/2 &&
          event.pos.y > this.y-this.img.height*this.scale/2 &&
          event.pos.y < this.y+this.img.height*this.scale/2) {
        this.scale = 0.07;
        this.hover = true;   
      } else {
        this.scale = 0.05;
        this.hover = false;
      }
    });

    engine.onMouseDown(event => {
      if ( !engine.fullscreen && this.hover ) {
        engine.goFullscreen();
      }
    })
  }

  draw(ctx, engine) {
    if(!engine.fullscreen) {
      var sourceImage = this.img.img;
      this.img.draw(ctx,
        this.x-sourceImage.width*this.scale/2, this.y-sourceImage.height*this.scale/2,
        sourceImage.width*this.scale, sourceImage.height*this.scale);
    }
  }
}