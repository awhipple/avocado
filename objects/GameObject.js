import { BoundingRect, Coord } from "../engine/GameMath.js";

export default class GameObject {
  on = true;
  die = false;
  collisionCallbacks = {};
  collision = "rectangle";

  constructor(engine, shape = {}) {
    this.engine = engine;
    
    this._pos = new Coord();

    if ( shape.radius ) {
      this._rect = new BoundingRect(
        shape.x - shape.radius, shape.y - shape.radius,
        2 * shape.radius, 2 * shape.radius
      );
      this.x = shape.x;
      this.y = shape.y;
    } else {
      this.rect = new BoundingRect(shape.x ?? 0, shape.y ?? 0, shape.w ?? 100, shape.h ?? 100);
    }

    this.updateScreenRect();
  }

  updateScreenRect() {
    this.screenRect = this._cam ? this._cam.getScreenRect(this.rect) : this.rect;
  }

  offScreen(by = 0) {
    return (
      this.rect.x + this.rect.w < -by ||
      this.rect.y + this.rect.h < -by ||
      this.rect.x > this.engine.window.width + by ||
      this.rect.y > this.engine.window.height + by
    );
  }

  onCollision(callback, target = "all") {
    this.collisionCallbacks[target] = callback;
  }

  lineIntercept(x, y, dir) {
    if ( this.rect.contains(x, y) ) {
      return { x, y };
    }

    var slope = Math.tan(dir);
    var yInt = y - (slope * x);
    
    var right = this.rect.x + this.rect.w;
    var bottom = this.rect.y + this.rect.h;

    if ( y < this.rect.y ) {
      var xIntTop = (this.rect.y - yInt) / slope;
      if ( xIntTop >= this.rect.x && xIntTop <= right ) {
        return {x: xIntTop, y: this.rect.y};
      }
    }

    if ( y > bottom ) {
      var xIntBot = (bottom - yInt) / slope;
      if ( xIntBot >= this.rect.x && xIntBot <= right ) {
        return {x: xIntBot, y: bottom};
      }
    }

    if ( x < this.rect.x ) {
      var yIntLeft = slope * this.rect.x + yInt;
      if ( yIntLeft >= this.rect.y && yIntLeft <= bottom ) {
        return { x: this.rect.x, y: yIntLeft};
      }
    }

    if ( x > right ) {
      var yIntRight = slope * right + yInt;
      if ( yIntRight >= this.rect.y && yIntRight <= bottom) {
        return { x: right, y: yIntRight };
      }
    }
    
    return null;
  }
    
  draw(ctx, engine, color = "#00f", borderColor = "#000") {
    ctx.save();
    ctx.fillStyle = this.color ?? color;
    ctx.fillRect(this.screenRect.x, this.screenRect.y, this.screenRect.w, this.screenRect.h);
    if ( !this.hideBorder ) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(this.screenRect.x, this.screenRect.y, this.screenRect.w, this.screenRect.h);
    }
    ctx.restore();
  }

  get x() {
    return this._pos.x;
  }

  set x(val) {
    this._pos.x = val;
    this._rect.x = this.x - this._rect.w / 2;
    this._radius = Math.min(this._pos.x, this._pos.y) / 2;
  }

  get y() {
    return this._pos.y;
  }

  set y(val) {
    this._pos.y = val;
    this._rect.y = this.y - this._rect.h / 2;
    this._radius = Math.min(this._pos.x, this._pos.y) / 2;
  }

  get pos() {
    return this._pos;
  }

  set pos(val) {
    this.x = val.x;
    this.y = val.y;
  }

  get rect() {
    return this._rect;
  }

  set rect(val) {
    this._rect = val;
    this._pos.x = val.x + val.w / 2;
    this._pos.y = val.y + val.h / 2;
    this._radius = Math.min(this._pos.x, this._pos.y) / 2;
  }

  get radius() {
    return this._radius;
  }

  set radius(val) {
    this.rect.x = this.x - val;
    this.rect.y = this.y - val;
    this.rect.w = val * 2;
    this.rect.h = val * 2;
  }

  get originX() {
    return this._rect.x;
  }

  set originX(val) {
    this.x = val + this._rect.w/2;
  }
  
  get originY() {
    return this._rect.y;
  }

  set originY(val) {
    this.y = val + this._rect.h/2;
  }

  get cam() {
    return this._cam;
  }

  set cam(cam) {
    this._cam = cam;
  }
}