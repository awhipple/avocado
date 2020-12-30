class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  set r(val) {
    this._r = Math.round(val);
    this.updateHex();
  }

  get r() {
    return this._r;
  }

  set g(val) {
    this._g = Math.round(val);
    this.updateHex();
  }

  get g() {
    return this._g;
  }

  set b(val) {
    this._b = Math.round(val);
    this.updateHex();
  }

  get b() {
    return this._b;
  }

  updateHex() {
    if ( this.r && this.g && this.b ) {
      this._hex = "#" + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }
  }

  get hex() {
    return this._hex;
  }
}

Color.random = () => {
  return new Color(
    Math.random()*256,
    Math.random()*256,
    Math.random()*256
  )
}

Color.white = new Color(255, 255, 255);

export default Color;