import Text from "./Text.js";

export default class FlashText extends Text {
  alpha = 1;
  hide = true;
  z = 100;
  
  constructor(engine) {
    super('', engine.window.width/2, 20, {fontColor: "#a33", center: true});
  }

  show(str, options = {}) {
    this.str = str;
    this.alpha = 1;
    this.hide = false;
    this.fontColor = options.color ?? "#a33";
    this.showFor = options.showFor ?? 4;
    this.y = options.y ?? 20;
  }
  
  update() {
    this.showFor = Math.max(this.showFor -= 1/60, 0);
    this.alpha = Math.min(this.alpha, this.showFor);
  }
}