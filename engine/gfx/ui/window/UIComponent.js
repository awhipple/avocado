import Image from "../../Image.js";

// Classes should extend this and implement the drawComponent method
export class UIComponent {

  constructor(engine) {
    this.engine = engine;
  }

  initialize() {
    this.canvas = document.createElement("canvas");
    this.width = this.width ?? this.suggestedWidth;
    this.canvas.width = this.width;
    this.canvas.height = this.height ?? 100;
    
    this.img = new Image(this.canvas);
    this.ctx = this.canvas.getContext("2d");
  }
  
  getDisplayImage() {
    if ( !this.ctx ) {
      this.initializeCanvas();
    }

    this._clearCanvas();

    this.drawComponent();
    
    return this.img;
  }

  drawComponent() {
    this.ctx.save();
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
  
  _clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}