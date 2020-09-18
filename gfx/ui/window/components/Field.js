import { BoundingRect } from "../../../../engine/GameMath.js";
import Text from "../../../Text.js";
import { UIComponent } from "../UIComponent.js";

export default class Field extends UIComponent{
  cursorBlinkSpeed = 40;

  constructor(engine, options = {}) {
    super(engine);

    this.options = options;
    this.text = new Text('', 7, 7, {fontSize: 23});

    this.cursorX = 10;

    engine.onKeyPress(evt => {
      if ( evt.key.length === 1 ) {
        this._addTextCharacter(evt.key);
      }
      if ( evt.key === "backspace" ) {
        this._removeTextCharacter();
      }
    });
  }

  initialize() {
    super.initialize();
    this.rect = new BoundingRect(2, 10, this.width-4, 25);
    this.showCursor = this.cursorBlinkSpeed;
  }

  update() {
    this.showCursor--;
    if ( this.showCursor < -this.cursorBlinkSpeed ) {
      this.showCursor = this.cursorBlinkSpeed;
    }
  }

  drawComponent() {
    this.rect.draw(this.ctx, "black");
    this.text.draw(this.ctx);
    
    if ( this.showCursor > 0 ) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.cursorX, 13);
      this.ctx.lineTo(this.cursorX, 31);
      this.ctx.stroke();
    }
  }

  _addTextCharacter(character) {
    this.text.setText(this.text.str + character);
    this.cursorX = 9 + this.text.getWidth(this.ctx);
  }

  _removeTextCharacter() {
    this.text.setText(this.text.str.substring(0, this.text.str.length - 1));
    this.cursorX = 9 + this.text.getWidth(this.ctx);
  }
}
