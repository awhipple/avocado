import Image from "../Image.js";

/**
 * Contains an array of images that together make an animation
 */
export default class KeyFrames {
  /**
   * 
   * @param {[Image]} keyFrames 
   */
  constructor(keyFrames) {
    this.frames = keyFrames;
  }

  /**
   * Draws all of the keyframes, primarily for debug.
   * 
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * 
   * @returns {void}
   */
  draw(ctx, x = 0, y = 0) {
    for ( var i = 0; i < this.frames.length; i++ ) {
      ctx.drawImage(this.frames[i].img, x, y);
      x += this.frames[i].img.width;
    }
  }
}
