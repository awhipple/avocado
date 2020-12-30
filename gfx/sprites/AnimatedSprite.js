import Image from "../Image.js";
import Animation from "./Animation.js";

/**
 * A stateful wrapper that runs an animation
 */
export default class AnimatedSprite {
  frame = 0;
  delta = 0;

  /**
   * @param {Animation} animation 
   */
  constructor(animation) {
    this.animation = animation;
  }

  /**
   * Should be run 60 times per second.
   * 
   * @returns {void}
   */
  update() {
    this.delta += 1/60;
    if ( this.delta > this.animation.speed ) {
      this.frame++;
      if ( this.frame >= this.animation.frameCount() ) {
        this.frame = this.animation.repeat ? 0 : this.animation.frameCount - 1;
      }
      this.delta -= this.animation.speed;
    }
  }
  
  /**
   * Returns the current frame of the animation
   * 
   * @returns {Image}
   */
  getFrame() {
    return this.animation.keyFrames.frames[this.frame];
  }
}