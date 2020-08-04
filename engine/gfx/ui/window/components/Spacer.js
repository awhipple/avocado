import { UIComponent } from "../UIComponent.js";

export default class Spacer extends UIComponent{
  constructor(engine, options = {}) {
    super(engine);

    this.height = options.height ?? 100;
  }

  drawComponent() {
    
  }
}
