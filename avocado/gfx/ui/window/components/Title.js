import { UIComponent } from "../UIComponent.js";

export default class Title extends UIComponent{
  constructor(engine, options = {}) {
    super(engine);

    this.bgColor = options.bgColor;

    this.icon = options.icon;
    this.options = options;

    this.height = (options.fontSize ?? 50) * 1.2;
  }

  initialize() {
    super.initialize();

    this.text = this.options.textObj["str"] ?? this.options.textObj["title"];
    this.text.x = this.options.center ? this.suggestedWidth/2 : 0;

    if ( this.icon ) {
      this.text.x += options.fontSize + 10;
    }
  }

  drawComponent() {
    if ( this.bgColor ) {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    if ( this.icon ) {
      this.icon.draw(this.ctx, 0, 3, this.text.fontSize, this.text.fontSize);
    }
    this.text.draw(this.ctx);
  }
}
