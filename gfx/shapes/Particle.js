import Image from "../Image.js";
import GameObject from "../../objects/GameObject.js";
import { shallow } from "../../engine/Tools.js";

export default class Particle extends GameObject {
  static drawQueue = [];
  static particleColorMap = {};
  static partSheets = {};
  static propertyDefaults = {
    x: 50, y: 50,
    r: 0, g: 0, b: 0,
    dir: 0, radius: 50, alpha: 1,
  };
  static transitionFunctions = {
    none: d => 0,
    easeIn: d => Math.sin(d * Math.PI/2),
    easeOut: d => 1 - Math.sin((1-d) * Math.PI/2),
    easeBoth: d => {
      var dist = Math.pow((0.5-Math.abs(0.5-d))/0.5, 2)*0.5;
      return d < 0.5 ? dist : 1 - dist;
    },
    volatile: d => d % 0.01 > 0.005 ? 0 : d,
    random: d => Math.random(),
  }
  
  z = 1000;

  // This stuff got a little funky due to maintaining backwards compatibility.
  // Intended usage is new Particle([ <transitions ], { <options> })
  // However, other legacy formats are also supported.
  constructor(options = {}, secondaryOptions = {}) {
    super(null, {x: 50, y: 50, radius: 50});

    if ( Array.isArray(options) ) {
      options = { transitions: options, ...secondaryOptions };
    }

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

    for ( var i = 0; i < this.transitions.length; i++ ) {
      var tran = this.transitions[i];
      if ( Array.isArray(tran) ) {
        var repeat = this.transitions.splice(i, 1)[0];
        var times = repeat.shift();
        for ( var k = 0; k < times; k++ ) {
          var newR = [];
          repeat.forEach(obj => newR.push(shallow(obj)));
          this.transitions.splice(i, 0, ...newR);
        }
      }
    }

    this._normalizeTransitionColors(options.optimizeColors ?? 16);
    this.deltaTransitions = this._generateDeltaTransitions();

    this._setState({...Particle.propertyDefaults, ...this.transitions[0]});
 
    this.currentTran = 0;
    this.lifeSpan = this.transitions[this.transitions.length-1].time;

    this.z = options.z ?? this.z;
    this.imgName = options.imgName ?? "";
    this.timer = 0;
  }

  update() {
    this.timer += 1/60;

    while ( 
      this.transitions[this.currentTran + 1] && 
      this.timer > this.transitions[this.currentTran + 1].time 
    ) {
      this._setState(this._generateDeltaState(1, true));
      this.currentTran++;
    }

    if ( this.engine && this.timer > this.lifeSpan ) {
      this.die = true;
    }

    var tran = this.transitions[this.currentTran];
    this._setState(this._generateDeltaState((this.timer - tran.time) / tran.duration));
  }

  draw(ctx) {
    if ( this.alpha <= 0 ) {
      return;
    }
    if ( this.drawTarget ) {
      var { x: px, y: py, w: pw, h: ph } = this.rect;
      var old = ctx.globalAlpha;
      ctx.globalAlpha = this.alpha;
      var { can } = Particle.partSheets[this.imgName][this.drawTarget.sheet];

      if ( this.dir === 0 ) {
        ctx.drawImage(can, this.drawTarget.x, this.drawTarget.y, 50, 50, px, py, pw, ph);
      } else {
        ctx.translate(px + pw/2, py + ph/2);
        ctx.rotate(this.dir);
        ctx.drawImage(can, this.drawTarget.x, this.drawTarget.y, 50, 50, 0 - pw/2, 0 - ph/2, pw, ph);
        ctx.rotate(-this.dir);
        ctx.translate(-px - pw/2, -py - ph/2);
      }
      ctx.globalAlpha = old;

    }
  }

  get r() {
    return this._r;
  }

  set r(val) {
    this._r = Math.floor(val);
    this._changeColor();
  }
  
  get g() {
    return this._g;
  }

  set g(val) {
    this._g = Math.floor(val);
    this._changeColor();
  }

  get b() {
    return this._b;
  }

  set b(val) {
    this._b = Math.floor(val);
    this._changeColor();
  }

  get img() {
    if ( !this._img ) {
      this._img = this.imgName === "" ? generateParticle() : this.engine.images.get(this.imgName);
    }
    return this._img;
  }

  _changeColor() {
    this.col = "rgb("+this.r+","+this.g+","+this.b+")";
  }

  _setState(state) {
    for ( var key in state ) {
      this[key] = state[key];
    }
  }

  _generateDeltaTransitions() {
    var timeStamp = 0;
    var deltaTransitions = [];
    this.transitions.forEach(tran => {
      tran.time = timeStamp;
      tran.duration = tran.duration ?? 1;
      if ( tran.duration === 0 ) {
        tran.duration = 1/59;
      }
      timeStamp += tran.duration;
    });

    var propLastSeen = {};
    this.transitions.forEach((tran, i) => {
      if ( i < this.transitions.length - 1 ) {
        var newDt = {};
        for ( var key in Particle.propertyDefaults ) {
          if ( i === 0 ) {
            this.transitions[0][key] = this.transitions[0][key] ?? Particle.propertyDefaults[key];
            propLastSeen[key] = 0;
          }

          if ( tran[key] !== undefined ) {
            propLastSeen[key] = i;
          }

          var propNextSeen = null;
          for ( var k = i + 1; k < this.transitions.length; k++ ) {
            if ( this.transitions[k][key] !== undefined ) {
              propNextSeen = k;
              break;
            }
          }

          // [ initial, deltaTransition, deltaStart, deltaEnd, tranFunc, bezier ]
          var lastTran = this.transitions[propLastSeen[key]];
          var nextTran = propNextSeen && this.transitions[propNextSeen];
          if ( nextTran ) {
            var lastVal = lastTran[key]?.[0] ?? lastTran[key];
            var [nextVal, dFunc] = Array.isArray(nextTran[key]) ? nextTran[key] : [ nextTran[key], d => d];
            if ( typeof dFunc === "string" ) {
              dFunc = Particle.transitionFunctions[dFunc] ?? (d => d);
            }
            var deltaChange = nextVal - lastVal;
            var totDur = nextTran.time - lastTran.time;
            if ( deltaChange !== 0 || nextTran.bx !== undefined || nextTran.by !== undefined) {
              newDt[key] = [
                lastVal, deltaChange,
                (tran.time - lastTran.time) / totDur,
                (this.transitions[i+1].time - lastTran.time) / totDur,
                dFunc,
              ];
              if ( ['x', 'y'].includes(key) && nextTran["b" + key] !== undefined) {
                var bez = nextTran["b" + key];
                newDt[key].push(bez);
              }
            }
          }
        }
        deltaTransitions.push(newDt);
      }
    });
    return deltaTransitions;
  }

  _generateDeltaState(delta, finalFrameState = false) {
    var newDeltaState = {};
    var tran = this.deltaTransitions[this.currentTran];
    for ( var key in tran ) {
      var t = tran[key];
      var frameDelta = (finalFrameState ? ()=>1 : t[4])(delta * (t[3] - t[2]) + t[2]);
      newDeltaState[key] = t[0] + t[1] * frameDelta;

      if ( t[5] !== undefined ) {
        var ys1 = t[0] + frameDelta * (t[5] - t[0]);
        var ys2 = t[5] + frameDelta * (t[0] + t[1] - t[5]);
        newDeltaState[key] = ys1 + frameDelta * (ys2 - ys1);
      }
    }

    return newDeltaState;
  }

  _normalizeTransitionColors(opt = 16) {
    if ( opt === 0 ) {
      return;
    }
    ['r', 'g', 'b'].forEach(color => {
      this.transitions.forEach(transition => {
        if ( transition?.hasOwnProperty(color) ) {
          if ( Array.isArray(transition[color]) ) {
            transition[color][0] = Math.round(transition[color][0]/opt)*opt;
          } else {
            transition[color] = Math.round(transition[color]/opt)*opt;
          }
        }
      });
    });
  }

  static prepParticlesForDraw(particles) {
    this._resetParticleSheet();
    particles.forEach(part => this._queueForDraw(part));
    this._drawParticleSheets();
  }

  static _resetParticleSheet() {
    this.drawQueue = [];
    this.particleColorMap = {};
    Particle.tSheet = {};
    Particle.tx = {};
    Particle.ty = {};
  }

  static _queueForDraw(particle) {
    Particle.drawQueue.push(particle);
    var pLookup = particle.imgName + ":" + particle.col;
    if ( Particle.particleColorMap[pLookup] === undefined) {
      Particle.particleColorMap[pLookup] = Particle._getNextSheetParticle(particle.imgName);
    }
    particle.drawTarget = Particle.particleColorMap[pLookup];
  }

  static _drawParticleSheets() {
    Particle.drawQueue.forEach(particle => {
      var draw = particle.drawTarget;
      var pLookup = particle.imgName + ":" + particle.col;
      if ( !Particle.particleColorMap[pLookup].drawn ) {
        if ( !Particle.partSheets[particle.imgName] ) {
          Particle.partSheets[particle.imgName] = [];
        }
        if ( draw.sheet >= Particle.partSheets[particle.imgName].length ) {
          var can = generateParticleSheet(particle.img);
          Particle.partSheets[particle.imgName].push({can, ctx: can.getContext("2d")});
        }
        var sheetCtx = Particle.partSheets[particle.imgName][draw.sheet].ctx;
        sheetCtx.fillStyle = particle.col;
        sheetCtx.fillRect(draw.x, draw.y, 50, 50);
        Particle.particleColorMap[pLookup].drawn = true;
      }
    });
    // console.log("Drawing " + Object.keys(Particle.particleColorMap).length + "/" + Particle.drawQueue.length + " particles on " + Particle.partSheets.length + " sheets.");
  }

  static _getNextSheetParticle(type = "") {
    if ( Particle.tSheet[type] === undefined ) {
      Particle.tx[type] = -50;
      Particle.ty[type] = 0;
      Particle.tSheet[type] = 0;
    }

    Particle.tx[type] += 50;
    if ( Particle.tx[type] >= 1000 ) {
      Particle.tx[type] = 0;
      Particle.ty[type] += 50;
      if ( Particle.ty[type] >= 1000 ) {
        Particle.ty[type] = 0;
        Particle.tSheet[type]++;
      }
    }

    return { sheet: Particle.tSheet[type], x: Particle.tx[type], y: Particle.ty[type], drawn: false };
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

  var i = 0, center = size / 2 - 1;
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

function generateParticleSheet(part) {
  part = part ?? generateParticle(50);
  var sheet = document.createElement("canvas");
  sheet.width = sheet.height = 1000;
  var ctx = sheet.getContext("2d");
  
  for ( var y = 0; y < 1000; y += 50 ) {
    for ( var x = 0; x < 1000; x += 50 ) {
      part.draw(ctx, x, y, 50, 50);
    }
  }

  ctx.globalCompositeOperation = "source-atop";

  return sheet;
}

export class ParticleSprite extends GameObject {
  z = 1000;
  constructor(shape, options = {}) {
    super(null, shape);

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
        this.particles.push(new Particle(this.generator()));
        this.nextQty--;
      }

      this.particles.forEach(particle => {
        particle.update();
      });
      Particle.prepParticlesForDraw(this.particles);
      this.particles = this.particles.filter(particle => particle.timer <= particle.lifeSpan);

      this.ctx.clearRect(0, 0, this.pw, this.ph);
      this.particles.forEach(particle => {
        particle.draw(this.ctx);
      });
    }
  }

  draw(ctx) {
    this.img.draw(ctx, this.rect);
  }
}