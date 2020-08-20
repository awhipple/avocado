import { NEXT_ORIENTATION, BoundingRect, Coord } from "../engine/GameMath.js";

export default class Image {
  static MIRROR_FLIP = {
    normal: "mirrored",
    mirrored: "normal",
  }

  constructor(img, orientation = "right", flip = "normal", orientationMap = null) {
    this.img = img;
    this.width = img.width;
    this.height = img.height;
    this.orientation = orientation;
    this.flip = flip;
    this.orientationMap = orientationMap || { right: { normal: this } };
    this.lastDrawn = new Date().getTime();
  }

  drawnWithin(sec) {
    return (new Date().getTime()) - this.lastDrawn < sec*1000;
  }
  
  draw(ctx, a, b, c, d, e) {
    this.lastDrawn = new Date().getTime();
    var x = null, y = null,
        w = null, h = null,
        coord = null, 
        rect = null, 
        options = null;
    if ( a instanceof BoundingRect ) {
      rect = a;
      options = b || {};
    } else if ( a instanceof Coord &&
      typeof b === "number" && typeof c === "number") {
        coord = a;
        w = b;
        h = c;
        options = d || {};
    } else if ( a instanceof Coord ) {
      coord = a;
      options = b || {};
    } else if ( typeof a === "number" && typeof b === "number" &&
                typeof c === "number" && typeof d === "number") {
      x = a;
      y = b;
      w = c;
      h = d;
      options = e || {};
    } else if ( typeof a === "number" && typeof b === "number" ) {
      x = a;
      y = b;
      options = c || {};
    } else {
      console.log(a, b);
      console.log(typeof a, typeof b)
      console.trace();
      console.log("Unsupported Image.draw call");
      return;
    }

    ctx.save();
    if ( options.alpha ) {
      ctx.globalAlpha = options.alpha;
    }
    var center = options.center ?? false;
    
    var drawWidth = rect?.w || w || this.img.width;
    var drawHeight = rect?.h || h || this.img.height;

    ctx.drawImage(this.img, 
      (rect?.x || coord?.x || x) - (center ? drawWidth/2 : 0), 
      (rect?.y || coord?.y || y) - (center ? drawHeight/2 : 0),
      drawWidth, drawHeight, 
    );

    ctx.restore();
  }

  // Optionally provide engine to ensure image gets drawn on top of everything else
  debug(ctx, engine = null) {
    if ( engine ) {
      engine.window.debugImage = this;
    } else {
      ctx.save();
      ctx.strokeStyle = "#f00";
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, this.img.width + 6, this.img.height + 6);
      ctx.drawImage(this.img, 6, 6, this.img.width, this.img.height);
      ctx.restore();
    }
  }

  rotate(targetOrientation = null) {
    targetOrientation = targetOrientation || NEXT_ORIENTATION[this.orientation];
    if ( this.orientationMap[targetOrientation]?.[this.flip] ) {
      return this.orientationMap[targetOrientation][this.flip];
    }

    var currentImage = this;
    while ( currentImage.orientation !== targetOrientation ) {
      var newCanvas = currentImage._rotateImage();
      var newOrientation = NEXT_ORIENTATION[currentImage.orientation];
      currentImage = new Image(newCanvas, newOrientation, currentImage.flip, this.orientationMap);
      this.orientationMap[newOrientation] = this.orientationMap[newOrientation] || {};
      this.orientationMap[newOrientation][this.flip] = currentImage;
    }
    return currentImage;
  }

  mirror() {
    var flipTo = Image.MIRROR_FLIP[this.flip];
    if ( this.orientationMap[this.orientation][flipTo] ) {
      return this.orientationMap[this.orientation][flipTo];
    }

    var flippedImage = new Image(this._mirrorImage(), this.orientation, flipTo, this.orientationMap);
    this.orientationMap[this.orientation][flipTo] = flippedImage;
    return flippedImage;
  }

  cut(width) {
    var i = 0;
    for ( var x = 0; x < this.width; x += width) {
      var newCan = document.createElement("canvas");
      newCan = document.createElement("canvas");
      newCan.width = width;
      newCan.height = this.height;
      var newCtx = newCan.getContext("2d");
      newCtx.drawImage(this.img, x, 0, width, this.height, 0, 0, width, this.height);
      this[i] = new Image(newCan);
      i++;
    }
    this.length = i;
  }

  _rotateImage() {
    var newCanvas = document.createElement("canvas");
    newCanvas.width = this.img.height;
    newCanvas.height = this.img.width;
    var newCtx = newCanvas.getContext("2d");

    newCtx.save();
    newCtx.fillStyle = "#fff";
    newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
    newCtx.translate(newCanvas.width/2, newCanvas.height/2);
    newCtx.rotate(Math.PI/2);
    newCtx.translate(-newCanvas.height/2, -newCanvas.width/2);
    newCtx.drawImage(this.img, 0, 0);
    newCtx.restore();

    return newCanvas;
  }

  _mirrorImage() {
    var newCanvas = document.createElement("canvas");
    newCanvas.width = this.img.width;
    newCanvas.height = this.img.height;
    var newCtx = newCanvas.getContext("2d");

    newCtx.save();
    newCtx.fillStyle = "#fff";
    newCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
    if ( this.orientation === "up" || this.orientation === "down" ) {
      newCtx.translate(this.img.width, 0);
      newCtx.scale(-1, 1);
    } else {
      newCtx.translate(0, this.img.height);
      newCtx.scale(1, -1);
    }
    newCtx.drawImage(this.img, 0, 0);
    newCtx.restore();

    return newCanvas;
  }

}