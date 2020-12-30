import KeyFrames from "./KeyFrames.js"

/**
 * Contains a set of keyframes, and properties describing an animation
 */
export default class Animation {
  repeat = true;
  speed = 0.5;

  /**
   * @param {KeyFrames} keyFrames 
   */
  constructor(keyFrames) {
    this.keyFrames = keyFrames;
  }

  /**
   * Returns the number of frames in the animation
   * 
   * @returns {Number}
   */
  frameCount() {
    return this.keyFrames.frames.length;
  }
}