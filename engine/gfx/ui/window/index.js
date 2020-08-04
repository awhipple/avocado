import GameObject from '../../../objects/GameObject.js';
import nativeComponents from './nativeComponents.js';
import { BoundingRect } from '../../../GameMath.js';
import Text from '../../Text.js';
import { shallow } from '../../../Tools.js';

export default class UIWindow extends GameObject {
  scroll = 0;

  constructor(engine, shape, ui = [], options = {}) {
    super(engine, shape);

    this.ui = ui;

    this.z = options.z ?? 100;
    this.bgColor = options.bgColor ?? "#fff";
    this.borderColor = options.borderColor ?? "#000";
    this.outerPadding = options.outerPadding ?? 10;
    this.innerPadding = options.innerPadding ?? options.padding ?? 15;
    
    this.scrollSpeed = options.scrollSpeed ?? 30;

    this.debug = options.debug ?? false;

    this._generateComponents();
  }

  update() {
    this.components.forEach(component => {
      component.update?.();
    });
  }

  draw(ctx) {
    ctx.save();

    super.draw(ctx, this.engine, this.bgColor, this.borderColor);

    if ( this.bgColor ) {
      this.ctx.fillStyle = this.bgColor;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    var currentY = this.innerPadding;
    this.components.forEach(component => {
      this._interpolateStrings(component);
      var img = component.getDisplayImage();
      img.draw(
        this.ctx,
        this.innerPadding + component.left, currentY,
        this.innerRect.w - this.innerPadding*2 - component.left, img.height
      );
      currentY += img.height + this.innerPadding;
    });

    ctx.drawImage(
      this.canvas, 
      0, this.scroll, 
      this.canvas.width, this.innerRect.h, 
      this.innerRect.x, this.innerRect.y, 
      this.innerRect.w, this.innerRect.h
    );

    ctx.restore();
  }

  onMouseClick(event) {
    this._triggerEventInComponents(event, "onMouseClick");
  }

  onMouseUp(event) {
    this._triggerEventInComponents(event, "onMouseUp");
  }

  onMouseWheel(event) {
    if ( this.debug ) {
      console.log(event);
    }

    if ( event.wheelDirection === "up" ) {
      this.scroll -= this.scrollSpeed;
    } else if ( event.wheelDirection === "down" ) {
      this.scroll += this.scrollSpeed;
    }

    this.scroll = Math.max(0, this.scroll);
    this.scroll = Math.min(this.maxScroll, this.scroll);

    this.onMouseMove(event);

    this._triggerEventInComponents(event, "onMouseWheel");
  }

  onMouseMove(event) {
    this._triggerEventInComponents(event, "onMouseMove");
  }

  get x() {
    return super.x;
  }

  set x(val) {
    super.x = val;

    this._setInnerRect();
  }

  get hide() {
    return this._hide;
  }

  set hide(val) {
    this._hide = val;
    this.hideComponents();
  }

  hideComponents() {
    this.components.forEach(component => component.hide?.());
  }

  _setInnerRect() {
    this.innerRect = new BoundingRect(
      this.rect.x + this.outerPadding, this.rect.y + this.outerPadding,
      this.rect.w - this.outerPadding * 2, this.rect.h - this.outerPadding * 2);
  }

  _generateComponents() {
    this.components = [];

    this._setInnerRect();
    this.componentHeightMap = [];

    this.ui.forEach(component => {
      component.text = component.text || {};
      if ( typeof component.text !== "object" ) {
        component.text = { str: component.text };
      }
      var Type = typeof component.type === "string" ?
        nativeComponents[component.type] :
        component.type;
      if ( Type ) {
        var newComponent = new Type(this.engine, component);
        newComponent.suggestedWidth = this.innerRect.w - this.innerPadding*2 - (component.left ?? 0);
        newComponent.left = component.left ?? 0;
        newComponent.options = component;
        this._interpolateStrings(newComponent);
        newComponent.initialize();
        this.components.push(newComponent);
        this.componentHeightMap.push([newComponent.height, newComponent]);
      }
    });

    this.canvas = this.canvas ?? document.createElement("canvas");
    this.canvas.width = this.rect.w - this.outerPadding*2;
    this.canvas.height = this.components.reduce(
      (total, com) => total + com.canvas.height + this.innerPadding, 0
    ) + this.innerPadding;
    this.ctx = this.canvas.getContext("2d");
    this.maxScroll = Math.max(0, this.canvas.height - this.rect.h + this.outerPadding * 2);
  }

  _triggerEventInComponents(event, eventType) {
    var totalPadding = this.outerPadding + this.innerPadding;

    event = shallow(event, 2);
    var windowX = event.relPos.x - totalPadding;
    event.pos = { y: event.relPos.y + this.scroll - totalPadding };
    delete event.relPos;
    for ( var i = 0; i < this.componentHeightMap.length; i++ ) {
      var component = this.componentHeightMap[i][1];
      if ( typeof component[eventType] === "function") {
        event.pos.x = windowX * ( component.suggestedWidth / (this.innerRect.w - this.innerPadding*2 - component.left) ) - component.left;
        component[eventType](event);
      }
      event.pos.y -= this.componentHeightMap[i][0] + this.innerPadding;
    }
  }

  _interpolateStrings(component) {
    if ( !component.options.textObj ) {
      component.options.interpolatedStrings = {};
      component.options.textObj = {};
      if ( typeof component.options.text === "object" ) {
        for ( var key in component.options.text ) {
          component.options.textObj[key] = new Text('', 0, 0, component.options);
        }
      }
    }
    if ( typeof component.options.text === "object" ) {
      for ( var key in component.options.text ) {
        var text = component.options.text[key];
        var inter = component.options.interpolatedStrings;
        if ( typeof text === "string" ) {
          inter[key] = text;
        } else if ( typeof text === "function" ) {
          inter[key] = text();
        }
        component.options.textObj[key].setText(inter[key] ?? '');
      }
    }
  }
}
