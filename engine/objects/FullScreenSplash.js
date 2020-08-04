export default class FullscreenSplash {
  z = 100;

  constructor(engine) {
    this.engine = engine;

    engine.onMouseDown(event => {
      if ( !this.engine.fullscreen ) {
        engine.goFullscreen();
      }
    });
  }

  draw(ctx) {
    if ( !this.engine.fullscreen ) {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, this.engine.window.width, this.engine.window.height);
      ctx.fillStyle = "#fff";
      ctx.font = "50px Arial";
      ctx.fillText("Click to Play!", 10, 60);
      ctx.stroke();
    }
  }
}