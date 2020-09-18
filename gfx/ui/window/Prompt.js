import UIWindow from "./index.js";

export default class Prompt extends UIWindow {
  z = 40;

  constructor(engine, prompt) {
    super(engine, {x: engine.window.width/2 - 150, y: engine.window.height/2 - 50, w: 300, h: 100}, [
      {
        type: "title",
        text: prompt,
        fontSize: 20,
      },
      {
        type: "spacer",
        height: 5,
      },
      {
        type: "field"
      }
    ], {
      innerPadding: 0,
    });
  }
}