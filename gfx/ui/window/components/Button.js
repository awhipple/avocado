import { UIComponent } from "../UIComponent.js";
import Text from "../../../Text.js";
import { BoundingRect } from "../../../../GameMath.js";

export default class Button extends UIComponent{
  constructor(engine, options = {}) {
    super(engine);

    this.bgColor = options.bgColor;
    this.borderColor = options.borderColor ?? "white";
    this.center = options.center;
    this.padding = options.padding ?? 15;
    this.callback = options.callback ?? (() => {});
    this.options = options;

    this.height = (options.fontSize ?? 50) * 1.4;

    this.rect = new BoundingRect(0, 0, 0, this.height);
  }

  initialize() {
    super.initialize();

    this.text = new Text(
      this.options.buttonText ?? this.options.text.button ?? '', 
      this.center ? this.suggestedWidth/2 : this.padding, 2, 
      this.options,
    );
  }

  onMouseMove(event) {
    this.hover = this.rect.contains(event.pos);
  }

  onMouseClick(event) {
    if ( this.hover ) {
      this.callback();
    }
  }

  update() {
    if ( this.hover ) {
      this.engine.cursor = "pointer";
    }
  }

  hide() {
    this.hover = false;
  }

  drawComponent() {
    if ( this.bgColor ) {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if ( this.rect.w === 0 ) {
      this.rect.w = this.text.getWidth(this.ctx) + this.padding*2;
      this.rect.x = this.center ? this.canvas.width/2 - this.rect.w/2 : 0; 
    }
    this.rect.draw(this.ctx, this.borderColor);
    
    this.text.draw(this.ctx);
  }
}
