import { Coord } from "../../engine/GameMath.js";
import Color from "../Color.js";

export default class Circle {
  static _singleton = new Circle(new Coord(0, 0), 0);
  arc = 1;
  
  constructor(pos, radius, options = {}) {
    this.pos = pos;
    this.radius = radius;

    this.color = options.color instanceof Color ? options.color.hex : options.color ?? "#000";
    console.log(this.color);
    this.alpha = options.alpha ?? 1;
    this.border = options.border ?? true;
  }

  draw(ctx) {
    ctx.save();

    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    if ( this.arc < 1 ) {
      ctx.moveTo(this.pos.x, this.pos.y);
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, this.arc * Math.PI * 2, false);
      ctx.lineTo(this.pos.x, this.pos.y);
      ctx.lineWidth = 0;
      ctx.fillStyle = this.color;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false);
      ctx.lineWidth = 1;
    } else {
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2, false);
      ctx.lineWidth = 1;
      ctx.fillStyle = this.color;
      ctx.fill();
    }
    if ( this.border ) {
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    ctx.restore();
  }

  static draw(ctx, x, y, radius, options = {}) {
    this._singleton.pos.x = x;
    this._singleton.pos.y = y;
    this._singleton.radius = radius;

    this._singleton.color = options.color ?? "#fff";
    this._singleton.alpha = options.alpha ?? 1;

    this._singleton.draw(ctx);
  }
}