import { BoundingRect } from "../../GameMath.js";

export default class ScoreBoard {
  z = 60;
  imageRect = new BoundingRect(10, 10, 60, 60);

  constructor(engine) {
    this.engine = engine;
  }

  draw(ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, 190, 85);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000";
    ctx.strokeRect(0, 0, 190, 85);

    this.engine.images.get("blueres").draw(ctx, this.imageRect);

    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText(0, 90, 60);

    ctx.stroke();
  }
}