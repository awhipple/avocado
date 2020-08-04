import { BoundingRect } from "../../GameMath.js";
import GameObject from "../../objects/GameObject.js";

export default class HotBar extends GameObject {
  selected = 0;

  iconDisabled = [];

  constructor(engine, iconImages = [], iconSize = 75, iconSpacing = 15) {
    super(engine);

    this.iconImages = iconImages;
    this.iconSize = iconSize;
    this.iconSpacing = iconSpacing;

    this._initializeDimensions();
  }

  onMouseClick(event) {
    if ( event.relPos.x % (this.iconSize + this.iconSpacing) > this.iconSpacing ) {
      this.select(Math.ceil((event.pos.x-this.rect.x)/(this.iconSize + this.iconSpacing)));
    }
  }

  addIcon(img) {
    this.iconImages.push(img);
    this._initializeDimensions();
  }

  select(selected) {
    if(selected > 0 && selected <= this.iconCount) {
      this.selected = selected;
      if ( this.callback ) {
        this.callback(this.selected);
      }
    }
  }

  onSelect(callback) {
    this.callback = callback;
  }

  draw(ctx) {
    ctx.fillStyle = "#999";
    ctx.fillRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);
    ctx.lineWidth = 3;
    ctx.strokeRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h);

    ctx.font = "bold 15px Arial";
    for(var i = 0; i < this.iconCount; i++) {
      ctx.strokeStyle = this.selected === i + 1 ? "green" : "black";
      var startX = this.rect.x + (this.iconSize + this.iconSpacing) * i + this.iconSpacing;
      var startY = this.rect.y + this.iconSpacing;
      ctx.fillStyle = this.selected === i + 1 ? "lightgreen" : "white";
      ctx.fillRect(
        startX, startY,
        this.iconSize, this.iconSize,
      );
      if ( this.iconImages[i] ) {
        this.iconImages[i].draw(ctx, new BoundingRect(startX, startY, this.iconSize, this.iconSize));
      }
      if ( this.iconDisabled[i] ) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#722";
        ctx.fillRect(
          startX, startY,
          this.iconSize, this.iconSize,
        );
        ctx.globalAlpha = 1.0;
      }
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, this.iconSize, this.iconSize);
      ctx.fillStyle = "#fff";
      ctx.fillRect(startX, startY + this.iconSize - 17, 17, 17);
      ctx.strokeRect(startX, startY + this.iconSize - 17, 17, 17);
      ctx.fillStyle = "#000";
      ctx.fillText(i + 1, startX + 3, startY + this.iconSize - 3);
    }
  }

  _initializeDimensions() {
    this.iconCount = this.iconImages.length;

    var barWidth = this.iconCount * (this.iconSize + this.iconSpacing) + this.iconSpacing;
    var barHeight = this.iconSize + 2 * this.iconSpacing;

    this.rect = new BoundingRect(
      this.engine.window.width/2 - barWidth/2,
      this.engine.window.height - barHeight,
      barWidth, barHeight
    )
  }
}