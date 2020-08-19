import GameObject from "../objects/GameObject.js";

export default class TileSet extends GameObject {
  z = 0;

  constructor(engine, ground) {
    super(engine, {x: 0, y: 0, w: engine.window.width, h: engine.window.height});

    this.cam = engine.globals.cam;
    this.width = ground.length;
    this.height = ground[0].length;
    this.ground = ground;

    if ( this.cam ) {
      engine.onMouseUp(event => {
        if (event.button === "left") {
          this.cam.mouseDrag(false);
        }
      });
    }
  }

  onMouseClick(event) {
    if ( event.button === "left" ) {
      this.cam?.mouseDrag(true);
    }
    //Temp Code
    this.engine.trigger("menuOff");
  }

  onMouseWheel(event) {
    if ( event.wheelDirection === "up" ) {
      this.cam.zoomIn(0.1);
    } else if ( event.wheelDirection === "down" ) {
      this.cam.zoomOut(0.1);
    }
  }

  within(pos) {
    return (
      pos.x > 0 && pos.x < this.width &&
      pos.y > 0 && pos.y < this.height
    );
  }

  draw(ctx) {
    var tileSpanX = this.engine.window.width / this.cam.zoom + 1,
        startTileX = Math.max(0, Math.floor(this.cam.x - tileSpanX/2)),
        endTileX = Math.min(this.width, Math.ceil(this.cam.x + tileSpanX/2));

    var tileSpanY = this.engine.window.height / this.cam.zoom + 1,
        startTileY = Math.max(0, Math.floor(this.cam.y - tileSpanY/2)),
        endTileY = Math.min(this.height, Math.ceil(this.cam.y + tileSpanY/2));

    for(var y = startTileY; y < endTileY; y++) {
      for(var x = startTileX; x < endTileX; x++) {
        this.engine.images.get(this.ground[x][y]).draw(ctx, this.cam.getScreenRect({x, y, w: 1, h: 1}));
      }
    }
  }
}