import { BoundingRect, Coord } from "../GameMath.js";

export default class Camera {
  _mouseDrag = false;

  constructor(engine, x, y, zoom=100, minZoom=100, maxZoom=100) {
    this.engine = engine;
    this.x = x;
    this.y = y;
    this.zoom = zoom;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;

    engine.onMouseMove(event => {
      if ( this._mouseDrag ) {
        this.moveRelative(
          this._lastMousePos.x - event.pos.x,
          this._lastMousePos.y - event.pos.y
        );

        this._lastMousePos = event.pos;
      }
    })
  }

  move(xv, yv) {
    this.x += xv;
    this.y += yv;
  }

  moveRelative(xv, yv) {
    this.move(xv / this.zoom, yv / this.zoom);
  }

  zoomOut(factor) {
    this.zoom *= (1 - factor);
    this.zoom = Math.max(this.minZoom, this.zoom);
  }
  
  zoomIn(factor) {
    this.zoom *= (1 + factor);
    this.zoom = Math.min(this.maxZoom, this.zoom);
  }

  getScreenX(x) {
    return this.engine.window.width / 2 - (this.x - x) * this.zoom;
  }

  getScreenY(y) {
    return this.engine.window.height / 2 - (this.y - y) * this.zoom;
  }
  
  getScreenRect(rect) {
    return new BoundingRect(
      this.getScreenX(rect.x), this.getScreenY(rect.y),
      this.zoom * rect.w, this.zoom * rect.h
    );
  }

  getX(screenX) {
    return (this.engine.window.width / 2 - screenX) / -this.zoom + this.x;
  }
  
  getY(screenY) {
    return (this.engine.window.height / 2 - screenY) / -this.zoom + this.y;
  }

  getPos(screenPos) {
    return new Coord(
      this.getX(screenPos.x),
      this.getY(screenPos.y)
    )
  }

  mouseDrag(on) {
    this._lastMousePos = this.engine.mouse.pos;
    this._mouseDrag = on;
  }
  
  getScreenPos(pos) {
    return new Coord(this.getScreenX(pos.x), this.getScreenY(pos.y));
  }
}