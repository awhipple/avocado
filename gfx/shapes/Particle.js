import Image from "../Image.js";
import GameObject from "../../objects/GameObject.js";
import { shallow } from "../../engine/Tools.js";

// This engine takes in a set of desired states called transitions. It then computes the 
// gradual animation to take the object from one transition state to the next.
// The method, _generateDeltaTransitions compiles the set of transitions into
// its actionable form, deltaTransitions.

/*
ex. transitions (provided by user):
[
  {x: 100, y: 500, duration: 5},
  {x: 200, duration: 2},
  {x: 100, y: 100},
]
*/

// The parameter "time" is hydrated into the above transition objects, 
// and is computed from duration. It represents what the clock should be at in
// seconds at the start of the transition. In this example, the first will get time: 0,
// the 2nd will get time: 5, and the 3rd will get time: 7.

// This transition array states that we want a particle to begin at (100, 500).
// The duration, 5, means that it will take 5 seconds to transition to the next state.
// It will take 5 seconds for the particle to slide from x:100 to x:200.
// The next duration, 2, means that it will then take 2 seconds for the particle to
// finish moving to (100, 100).

// There is one important caveat here. You will notice that y was omitted in the
// 2nd transition. This has special meaning to the particle engine. It means that starting
// from transition one, the particle should move at a linear rate from y:500 to y:100
// over the course of the total amount of time between all interim transitions.
// In this case, this means that the particle will move from y:500 to y:100 in 7 seconds
// starting from the beginning of its life.

// deltaTransitions are an engine format for the data to facilitate the computation of
// this complex dynamic. A delta transition can be thought of as occuring between each
// of the above transitions. As such, for the 3 transitions above, there will be 2
// delta transitions. One for spanning from transition 1 to 2, and one for 2 to 3.

// deltaTransitions contains all necessary information for the animation other than timing.

/* ex. deltaTransitions (to match the above 3 transitions):
[
  {
    x: [100, 100,  0, 1, d=>d, undefined],
    y: [500, -400, 0, 2, d=>d, undefined],
  },
  {
    x: [200, -100, 1, 2, d=>d, undefined],
    y: [500, -400, 0, 2, d=>d, undefined],
  }
]
*/

// The schema  of each array above is as follows.
// [initial, delta, startIndex, endIndex, transitionFunction, bezier]
//    initial: The value the parameter takes at the beginning of the transition.
//    delta: The amount the parameter will change over the course of the transition.
//    startIndex: The index of the transition that defines the start state of the parameter.
//    endIndex: The index of the transition that defines the end state of the parameter.
//    transitionFunction: Defines the transition method. Standard is d=>d and
//                        just adjusts the parameter in a linear fashion.
//    bezier: Used for x and y and defines a bezier transition point. This is for curved paths.

// To define a different transition function than d=>d, provide an array for a transition
// parameter instead of a scalar for the end state.
// Example: Rather than {x: 300} use {x: [300, d=>Math.pow(d, 2)]} or use one of the methods
//  as a string defined by transitionFunctions above like {x: [300, "easeIn"]}

// To use a bezier curve, provide bx and or by alongside their x and y counterparts in
// the end state transition. bx and by define the 2nd point in the bezier curve.
// Example: If a particle is at (100, 100), providing {x: 200, y: 100} would cause the
//  particle to slide in a linear fashion to the right. If we instead want the particle
//  to arc upward, we can provide {x: 200, y: 100, bx: 150, by: 0}
//  In this case the particle will trace a parabola up to y:50 due to the nature of bezier curves.

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
    none: (val = 0) => () => val,
    easeIn: () => d => Math.sin(d * Math.PI/2),
    easeOut: () => d => 1 - Math.sin((1-d) * Math.PI/2),
    easeBoth: (p = 2) => d => {
      var dist = Math.pow((0.5-Math.abs(0.5-d))/0.5, p)*0.5;
      return d < 0.5 ? dist : 1 - dist;
    },
    volatile: () => d => d % 0.01 > 0.005 ? 0 : d,
    random: () => d => Math.random(),
  }
  
  z = 30;

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
    this.faceDirection = options.faceDirection ?? false;

    this.timer = 0;

    this.update();
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

    var tran = this.transitions[this.currentTran], frameDelta = (this.timer - tran.time) / tran.duration;
    this._setState(this._generateDeltaState(frameDelta));

    var dTran = this.deltaTransitions[this.currentTran];
    if ( this.faceDirection && dTran ) {
      this._faceDirectionOfMotion(dTran, frameDelta);
    }
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
            var [nextVal, dFunc, ...args] = Array.isArray(nextTran[key]) ? nextTran[key] : [ nextTran[key], d => d];
            if ( typeof dFunc === "string" ) {
              dFunc = Particle.transitionFunctions[dFunc](...args) ?? (d => d);
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
        // Bezier Formula
        var sy = t[0], by = t[5], ey = t[0] + t[1], t1 = frameDelta, t2 = Math.pow(t1, 2);
        newDeltaState[key] = t2*sy - 2*t2*by + t2*ey - 2*t1*sy + 2*t1*by + sy;
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

  //Compute slope of bezier curves for faceDirection option
  _faceDirectionOfMotion(dTran, frameDelta) {
    var dx = dTran.x, sx = dx[0], bx = dx[5], ex = dx[0] + dx[1]
    var dy = dTran.y, sy = dy[0], by = dy[5], ey = dy[0] + dy[1]

    var tx = dx[4](frameDelta * (dx[3] - dx[2]) + dx[2]);
    var ty = dy[4](frameDelta * (dy[3] - dy[2]) + dy[2]);
    
    // First derivative of Bezier to get slope
    var rise = typeof by === "number" ? 2*ty*sy - 4*ty*by + 2*ty*ey - 2*sy + 2*by : ey - sy;
    var run = typeof bx === "number" ? 2*tx*sx - 4*tx*bx +2*tx*ex - 2*sx + 2*bx : ex - sx;
    var slope = rise / run;
    this.dir = Math.atan(slope);
    if ( run <= 0 ) {
      this.dir += Math.PI;
    }
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