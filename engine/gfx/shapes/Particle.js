import Image from "../Image.js";
import GameObject from "../../objects/GameObject.js";

export default class Particle extends GameObject {
  static drawQueue = [];
  static particleColorMap = {};
  static partSheets = [];
  static propertyDefaults = {
    x: 50, y: 50,
    r: 0, g: 0, b: 0,
    radius: 50, alpha: 1,
  };
  
  z = 1000;

  constructor(engine, options = {start:{}}) {
    super(engine, {x: 50, y: 50, radius: 50});

    this.transitions = options.transitions;
    if ( !this.transitions ) {
      this.transitions = [];
      options.start.duration = options.lifeSpan ?? 1;
      this.transitions.push(options.start);
      if ( options.end ) {
        this.transitions.push(options.end);
      }
    }
    if ( this.transitions.length === 1 ) {
      this.transitions.push({});
    }
    this._hydrateTransitions();
    
    this.optimizeColorTransitions = options.optimizeColorTransitions ?? true;
    if ( this.optimizeColorTransitions ) {
      ['r', 'g', 'b'].forEach(col => {
        this._normalizeColor(col);
      });
    }
    
    this._setState(this.transitions[0]);

    this.transitionDeltas = [];
    for ( var i = 0; i < this.transitions.length - 1; i++ ) {
      this.transitionDeltas.push({});
      for ( var key in this.transitions[i] ) {
        if ( typeof this.transitions[i][key] === "number" && typeof this.transitions[i+1][key] === "number" ) {
          this.transitionDeltas[i][key] = this.transitions[i+1][key] - this.transitions[i][key];
        }
      }
    }

    this.currentTran = 0;
    this.lifeSpan = this.transitions[this.transitions.length-1].time;

    this.timer = 0;
  }

  update() {
    this.timer += 1/60;

    while (this.transitions[this.currentTran + 1] && this.timer > this.transitions[this.currentTran + 1].time) {
      this.currentTran++;
    }
    if ( this.engine && this.timer > this.lifeSpan ) {
      this.engine.unregister(this);
    }
    var tran = this.transitions[this.currentTran];

    this._setState(this._generateDeltaState(((this.timer - tran.time) / tran.duration)));
  }

  draw(ctx) {
    Particle._queueForDraw(this);
  }

  get r() {
    return this._r ?? 0;
  }

  set r(val) {
    this._r = Math.floor(val);
    this._changeColor();
  }
  
  get g() {
    return this._g ?? 0;
  }

  set g(val) {
    this._g = Math.floor(val);
    this._changeColor();
  }

  get b() {
    return this._b ?? 0;
  }

  set b(val) {
    this._b = Math.floor(val);
    this._changeColor();
  }

  _changeColor() {
    this.col = "rgb("+this.r+","+this.g+","+this.b+")";
  }

  _setState(state) {
    for ( var key in state ) {
      this[key] = state[key];
    }
  }

  _generateDeltaState(delta) {
    var newDeltaState = {};
    var tran = this.transitions[this.currentTran];
    var tranDelt = this.transitionDeltas[this.currentTran];
    for ( var key in tranDelt ) {
      newDeltaState[key] = tran[key] + tranDelt[key] * delta;
    }
    if ( tran.bezierBeginPointer !== undefined ) {
      var firstTran = this.transitions[tran.bezierBeginPointer];
      var secondTran = this.transitions[tran.bezierEndPointer];
      var bTime = this.timer - firstTran.time;
      var bRatio = bTime / (secondTran.time - firstTran.time);
      
      var nx1 = firstTran.x + bRatio * (secondTran.bx - firstTran.x);
      var ny1 = firstTran.y + bRatio * (secondTran.by - firstTran.y);
      var nx2 = secondTran.bx + bRatio * (secondTran.x - secondTran.bx);
      var ny2 = secondTran.by + bRatio * (secondTran.y - secondTran.by);
      newDeltaState.x = nx1 + bRatio * (nx2 - nx1);
      newDeltaState.y = ny1 + bRatio * (ny2 - ny1);
    }
    return newDeltaState;
  }

  _normalizeColor(color) {
    this.transitions.forEach(transition => {
      if ( transition?.hasOwnProperty(color) ) {
        transition[color] = Math.round(transition[color]/16)*16;
      }
    });
  }

  _hydrateTransitions() {
    var time = 0;
    var prevTran;
    this.transitions.forEach((tran, i) => {
      if ( 
        i > 0 &&
        (tran.x !== undefined || tran.y !== undefined) &&
        tran.bx !== undefined && tran.by !== undefined 
      ) {
        var current = i - 1;
        while ( 
          current > 0 && 
          (this.transitions[current].x === undefined && this.transitions[current].y === undefined )
        ) {
          current--;
        }
        for ( var k = current; k < i; k++ ) {
          this.transitions[k].bezierBeginPointer = current;
          this.transitions[k].bezierEndPointer = i;
        }
      }

      tran.duration = tran.duration ?? 1;
      
      tran.time = time;
      time += tran.duration;
    });
    this.transitions.forEach((tran, i) => {
      for ( var key in Particle.propertyDefaults ) {
        if ( tran === this.transitions[0] ) {
          tran[key] = tran[key] ?? Particle.propertyDefaults[key];
        } else {
          if ( tran[key] === null || tran[key] === undefined ) {
            var {nextVal, nextTime} = this._getNextTransVarOccurence(i, key);
            if ( nextVal !== null ) {
              tran[key] = prevTran[key] + (((nextVal-prevTran[key]) * prevTran.duration) / (nextTime - prevTran.time));
            } else {
              tran[key] = prevTran[key];
            }
          }
        }
      }
      
      prevTran = tran;
    });
  }

  _getNextTransVarOccurence(i, key) {
    while ( i < this.transitions.length && (this.transitions[i][key] === undefined)) {
      i++;
    }
    if ( i === this.transitions.length ) {
      return {nextVal: null, nextTime: null};
    }
    return {nextVal: this.transitions[i][key], nextTime: this.transitions[i].time};
  }

  static _queueForDraw(particle) {
    Particle.drawQueue.push(particle);
    if ( Particle.particleColorMap[particle.col] === undefined) {
      Particle.particleColorMap[particle.col] = Particle._getNextSheetParticle();
    }
    particle.drawTarget = Particle.particleColorMap[particle.col];
  }

  static drawQueuedParticles(ctx) {
    Particle.drawQueue.forEach(particle => {
      var draw = particle.drawTarget;
      if ( !Particle.particleColorMap[particle.col].drawn ) {
        if ( draw.sheet >= Particle.partSheets.length ) {
          var can = generateParticleSheet();
          Particle.partSheets.push({can, ctx: can.getContext("2d")});
        }
        var sheetCtx = Particle.partSheets[draw.sheet].ctx;
        sheetCtx.fillStyle = particle.col;
        sheetCtx.fillRect(draw.x, draw.y, 50, 50);
        Particle.particleColorMap[particle.col].drawn = true;
      }
    });
    // console.log("Drawing " + Object.keys(Particle.particleColorMap).length + "/" + Particle.drawQueue.length + " particles on " + Particle.partSheets.length + " sheets.");
    this.drawQueue.forEach(particle => {
      var { x: px, y: py, w: pw, h: ph } = particle.rect;
      ctx.globalAlpha = particle.alpha;
      ctx.drawImage(Particle.partSheets[particle.drawTarget.sheet].can, particle.drawTarget.x, particle.drawTarget.y, 50, 50, px, py, pw, ph);
    });
    this.drawQueue = [];
    this.particleColorMap = {};
    Particle._resetParticleSheet();
  }

  static _getNextSheetParticle() {
    if ( Particle.tSheet === undefined ) {
      Particle.tx = -50;
      Particle.ty = 0;
      Particle.tSheet = 0;
    }

    Particle.tx += 50;
    if ( Particle.tx >= 1000 ) {
      Particle.tx = 0;
      Particle.ty += 50;
      if ( Particle.ty >= 1000 ) {
        Particle.ty = 0;
        Particle.tSheet++;
      }
    }

    return { sheet: Particle.tSheet, x: Particle.tx, y: Particle.ty, drawn: false };
  }

  static _resetParticleSheet() {
    Particle.tSheet = undefined;
  }
}

function generateParticle(size = 50) {
  if ( generateParticle.particle ) {
    return generateParticle.particle;
  }

  var can = document.createElement("canvas");
  can.width = can.height = size;
  var ctx = can.getContext("2d");
  var iData = ctx.getImageData(0, 0, size, size);
  var data = iData.data;

  var i = 0, center = size / 2;
  for ( var y = 0; y < size; y++ ) {
    for ( var x = 0; x < size; x++ ) {
      var dist = Math.sqrt(Math.pow(x-center, 2) + Math.pow(y-center, 2));
      
      data[i] = data[i + 1] = data[i + 2] = 255;
      data[i + 3] = Math.max((center - dist) / center, 0) * 255;

      i += 4;
    }
  }

  ctx.putImageData(iData, 0, 0);
  return generateParticle.particle = new Image(can);
}

function generateParticleSheet() {
  var part = generateParticle(50);
  var sheet = document.createElement("canvas");
  sheet.width = sheet.height = 1000;
  var ctx = sheet.getContext("2d");
  
  for ( var y = 0; y < 1000; y += 50 ) {
    for ( var x = 0; x < 1000; x += 50 ) {
      part.draw(ctx, x, y);
    }
  }

  ctx.globalCompositeOperation = "source-atop";

  return sheet;
}

export class ParticleSprite extends GameObject {
  z = 1000;
  constructor(engine, shape, options = {}) {
    super(engine, shape);

    this.pw = options.pw ?? 50;
    this.ph = options.ph ?? 50;

    this.qty = options.qty ?? 1;
    this.nextQty = 0;

    this.generator = options.generator ?? (() => ({
      start: {
        x: 25, y: 25,
        radius: 5,
        r: 255, g: 255, b: 255,
        alpha: 1,
      },
      end: {
        x: Math.random()*50, y: Math.random()*50,
        alpha: 0,
      },
      lifespan: 1,
    }));

    this.particles = [];
    
    this.can = document.createElement("canvas");
    this.can.width = this.pw;
    this.can.height = this.ph;
    this.ctx = this.can.getContext("2d");
    this.img = new Image(this.can);
  }

  update() {
    if ( this.img.drawnWithin(1)) {
      this.nextQty += this.qty;
      while ( this.nextQty >= 1 ) {
        this.particles.push(new Particle(null, this.generator()));
        this.nextQty--;
      }

      this.particles.forEach(particle => {
        particle.update();
      });
      this.particles = this.particles.filter(particle => particle.time <= particle.lifeSpan);

      this.ctx.clearRect(0, 0, this.pw, this.ph);
      this.particles.forEach(particle => {
        particle.draw(this.ctx);
      });

      Particle.drawQueuedParticles(this.ctx);
    }
  }

  draw(ctx) {
    this.img.draw(ctx, this.rect);
  }
}