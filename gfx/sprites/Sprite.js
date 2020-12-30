import {TestImage} from "../Image.js";

export default class Sprite {
  _rad = 0;
  alpha = 1;
  rotated = false;

  constructor() {
    this.img = TestImage;
    this.x = 100;
    this.y = 100;
    this.scale = 1;
  }

  get rad() {
    return this._rad;
  }

  set rad(value) {
    this._rad = value;
    if(!this.rotated) {
      var newSize = Math.sqrt(Math.pow(this.img.width/2, 2) + Math.pow(this.img.height/2, 2)) * 2;

      this.originalImg = this.img;
      this.img = document.createElement("canvas");
      this.img.width = newSize;
      this.img.height = newSize;
      this.imgCtx = this.img.getContext("2d");
      
      this.rotated = true;
    }
    this.imgCtx.save();
    this.imgCtx.fillStyle = "#fff";
    this.imgCtx.clearRect(0, 0, this.img.width, this.img.height);
    this.imgCtx.translate(this.img.width/2, this.img.height/2);
    this.imgCtx.rotate(this._rad);
    this.imgCtx.drawImage(this.originalImg, -(this.originalImg.width/2), -(this.originalImg.height/2));
    this.imgCtx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.img, 
      this.x-this.img.width*this.scale/2, this.y-this.img.height*this.scale/2, 
      this.img.width*this.scale, this.img.height*this.scale);
    ctx.restore();
  }
}
