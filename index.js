import Avocado from "./engine/GameEngine.js";
import Particle from "./gfx/shapes/Particle.js";

window.onload = function() {
  (new Game({mobileStretch: false})).start();
};

export default class Game {
  constructor(options = {}) {
    this.avo = new Avocado({
      width: 1000,
      height: 1000,
      bgColor: "#000",
      ...options
    });

    this.avo.images.preload(["spark", "face", "arrow", "person", "bonnie"]);

    this.currentEffect = 0;
    this.frameCount = 0;

    var div = document.createElement("div");
    div.style = "padding:50px;position:absolute;top:0"
    document.body.append(div);
    
    var selected = true;
    effects.forEach((effect, i) => {
      var innerDiv = document.createElement("div");
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "effect";
      radio.value = i;
      radio.addEventListener('change', () => this.setEffect(radio.value));
      radio.checked = selected;
      innerDiv.appendChild(radio);
      var label = document.createElement("label");
      label.innerHTML = effect.name;
      innerDiv.appendChild(label);
      div.appendChild(innerDiv);

      selected = false;
    });

    // Debug
    window.avo = this.avo;
    // this.engine.setProd();
  }

  start() {
    var listener = msg => console.log(msg);
    this.avo.net.connect(listener);
    this.avo.net.auth("aaron");
    this.avo.net.ping();
    this.avo.net.subscribe('testChannel');
    this.avo.net.send('testChannel', {a: 1});
    
    this.setEffect(0);
    this.avo.load().then(() => {
      this.avo.onUpdate(() => {
        this.frameCount++;
        var effect = effects[this.currentEffect];
        if ( this.frameCount >= (effect?.every ?? 1)) {
          this.frameCount = 0;
          for ( var i = 0; i < (effect?.times ?? 1); i++ ) {
            this.avo.register(effect.particles());
          }
        }
      });
    });
  }

  setEffect(val) {
    this.avo.unregister("particle");
    this.avo.onceCompleted = false;
    this.currentEffect = val;
    this.frameCount = effects[this.currentEffect].every ?? 0;
  }

}

function rCol() {
  return {
    r: Math.random() * 256,
    g: Math.random() * 256,
    b: Math.random() * 256,
  }
}

var galRotate = 0;

var lines = 50;
var lineSpeeds = [];
for ( var i = 0; i < lines; i++ ) {
  lineSpeeds.push(0.12 + Math.random() * 0.06);
}

var fireSway = 0;

var effects = [
  {
    name: "streams",
    every: 1,
    times: 5,
    particles: () => {
      var space = 1000 / (lines + 1);
      var line = Math.floor(Math.random() * lines);
      var x = (line + 1) * space;
      var speed = lineSpeeds[line];
      return new Particle([
        {x, y: -10, b: 255, radius: 5, duration: speed},
        [
          Math.floor(Math.random() * 10) + 5,
          {g: 0, alpha: 0, duration: speed},
          {g: 128, alpha: 1, duration: speed},
        ],
        {alpha: 0, duration: speed},
        {y: [1010, "easeOut"], r: 0, g: 128, b: 255, alpha: 1, radius: 5, duration: 0},
        {x, y: 1100, r: 255, g: 255, b: 255, alpha: 0.15},
        {x: x + Math.random() * 500 - 250, y: 980, radius: 120, alpha: 0}
      ]);
    }
  },
  {
    name: "silly face parade",
    every: 60,
    times: 1,
    particles: () => {
      var anim = [ { x: -100, y: 500, radius: 20, duration: 1, ...rCol() } ];
      var rot = 0;
      for ( var i = 0; i < 8; i++ ) {
        rot += Math.PI*3*Math.random() + 0.3;
        anim.push({dir: [rot, "easeBoth"], duration: 0.5});
        rot -= Math.PI*3*Math.random() + 1;
        anim.push({dir: [rot, "easeBoth"], duration: 0.5});
      }
      var destCol = rCol();
      return [
        new Particle( [
          ...anim, 
          { dir: [6.28, "easeBoth"], x: 1100, y: 500, by: -200, radius: 65 + Math.random() * 30, ...destCol }
        ], { imgName: "bonnie" }),
        new Particle( [
          ...anim, 
          { dir: [6.28, "easeBoth"], x: 1100, y: 500, by: 1200, radius: 65 + Math.random() * 30, ...destCol }
        ], { imgName: "face" }),
      ]      
    }
  },
  {
    name: "rain with splash",
    every: 1,
    times: 5,
    particles: () => {
      var x = Math.random() * 1000;
      return new Particle([
        { x, y: -20, radius: 10, r: 128, g: 128, b: 255, duration: 0.4 + Math.random() * 0.2 },
        { y: 1000, radius: 10, r: 0, g: 0, duration: 0 },
        { radius: 4, r: 128, g: 128, duration: 0.5 },
        { x: x + Math.random() * 400 - 200, y: 1000, by: 600 + Math.random() * 200, radius: 5 }
      ]);
    }
  },
  {
    name: "supernova",
    every: 1100,
    times: 8,
    particles: () => {
      var g = Math.random() * 128 + 128;
      return new Particle([
        { x: 500, y: 500, radius: 400, r: 255, g, duration: 2 },
        { radius: [450, "easeOut"], duration: 0.4 },
        { radius: [400, "easeIn"], duration: 2 },
        { radius: [450, "easeOut"], duration: 0.4 },
        { radius: [400, "easeIn"], duration: 2 },
        { radius: [450, "easeBoth"], duration: 0.4 },
        { duration: 4 },
        { r: 255, g, b: 0, radius: [470, "volatile"], duration: 0.4 },
        { radius: [25, "easeIn"], r: 255, g: 255, b: 255, duration: 0.5 },
        { x: 500, y: 500, radius: 15, duration: 0.5 },
        { x: Math.random() * 2000 - 500, y: Math.random() * 2000 - 500, radius: 1500, alpha: 1, duration: 5 },
        { alpha: 0 },
      ]);
    }
  },
  {
    name: "magic arrows",
    every: 5,
    times: 2,
    particles: () => {
      var rad = Math.random()*Math.PI*2;
      var spreadRadius = 300;
      var r = Math.random(), g = Math.random(), b = Math.random();
      var duration = Math.random() * 2;
      var fx = 750 + Math.cos(rad) * spreadRadius * 0.5 * Math.random();
      var fy = 600 + Math.sin(rad) * spreadRadius * 0.5 * Math.random();
      var bx = -200 + Math.cos(rad) * spreadRadius * Math.random();
      var by = -400 + Math.sin(rad) * spreadRadius * Math.random();
      return [
        new Particle([
          { x: 400, y: 1025, r: 50, g: 255, b: 225, radius: 40, duration: 0.5, alpha: 0.6 },
          { duration },
          { r: r * 64, g: g * 80, b: b * 256, radius: 100, duration: 0.5 },
          { r: r * 256, g: g * 256, b: b * 256, duration: 0.5 },
          { x: [fx, "easeIn"], y: [fy, "easeIn"], bx, by, radius: 0 }
        ]),
        new Particle([
          { x: 400, y: 1025, r: 50, g: 255, b: 225, radius: 20, duration: 0.5 },
          { duration },
          { r: r * 64, g: g * 80, b: b * 256, radius: 50, duration: 0.5 },
          { r: r * 256, g: g * 256, b: b * 256, duration: 0.5 },
          { x: [fx, "easeIn"], y: [fy, "easeIn"], bx, by, radius: 0 }
        ], {imgName: "arrow", faceDirection: true}),
      ];
    }
  },
  {
    name: "twinkle",
    times: 10,
    particles: () => new Particle([
      {
        x: Math.random()*1000, y: Math.random()*1000,
        radius: 0,
        r: 255, g: 255, b: 255,
        alpha: 0,
        duration: 0.3,
      },
      {
        radius: 3,
        alpha: [1, "easeIn"],
        duration: 0.3,
      },
      {
        radius: 0,
        alpha: [0, "easeOut"],
      },
    ]),
  },
  {
    name: "geyser",
    times: 5,
    particles: () => new Particle({
      transitions: [
        {
          x: 490 + Math.random()*20, y: 1050,
          radius: 25,
          r: 170, g: 255, b: 255,
        },
        {
          x: Math.random()*1000, y: 1050,
          radius: 30,
          r: 0, g: 0,
          bx: 500, by: Math.random()*200-300,
          duration: 0,
        },
        {
          r: 255, g: 255, b: 255,
          radius: 80,
          alpha: 0.05,
          duration: 2,
        },
        {
          y: 0,
          radius: 0,
          alpha: 0,
        },
      ]
    }),
  },
  {
    name: "bezier",
    every: 60,
    particles: () => new Particle([
      {
        x: 0, y: 1000,
        r: 255,
      },
      {
        x: 1000, y: 1000,
        bx: 500, by: 0,
        r: 0, g: 255,
      },
      {
        x: 1000, y: 0,
        bx: 0, by: 500,
        g: 0, b: 255,
      },
      {
        x: 0, y: 0,
        bx: 500, by: 1000,
        r: 255, g: 255, b: 0,
      },
      {
        x: 0, y: 1000,
        bx: 1000, by: 500,
        g: 0,
      },
    ], {imgName: "arrow", faceDirection: true}),
  },
  {
    name: "galaxy",
    particles: () => {
      var parts = [];
      for ( var i = 0; i < 4; i++ ) {
        var rad = Math.random() * Math.PI * 2;
        var [r, g, b] = Math.random() < 0.05 ? [Math.random()*256, Math.random()*256, Math.random()*256] : [255, 255, 255];
        if ( rad % (Math.PI/2) < 0.7) {
          parts.push(new Particle({
            transitions: [
              {
                x: 500, y: 500,
                r, g, b,
                radius: 3,
                alpha: 0.1,
                duration: 20,
              },
              {
                radius: Math.random()*5+5,
                alpha: 1,
                duration: 1,
              },
              {
                x: 500 + Math.cos(rad + galRotate) * (300 + Math.random() * 16), y: 500 + Math.sin(rad + galRotate) * (150 + Math.random()*8),
                radius: 1,
                alpha: 0,
              },
            ],
          }));
          galRotate += 0.004;
        }
      }
      if ( Math.random() < 0.08 ) {
        parts.push(new Particle({
          start: {
            x: 500, y: 500,
            r: 255, g: 255, b: 255,
            radius: 90,
            alpha: 0.4,
          },
          end: {
            x: 300 + Math.random() * 400, y: 490 + Math.random() * 20,
            r: 200, g: 200, b: 100,
            radius: Math.random()*5+5,
            alpha: 0,
          },
          lifeSpan: 16,
        }));
      }
      return parts;
    }
  },
  {
    name: "flames",
    times: 10,
    particles: () => {
      var parts = [];
      var x = Math.random()*200 + 400;
      var xo = Math.random()*2-1;
      var swayX = Math.sin(fireSway);
      fireSway += 0.007;
      if ( Math.random() < 0.02) {
        // Smoke
        parts.push(new Particle({
          start: {
            x: 500, y: 700,
            r: 255, g: 255, b: 255,
            radius: 0,
            alpha: 0.1,
          },
          end: {
            x: Math.random()*300 + 350, y: 100,
            radius: 100,
            alpha: 0,
          },
          lifeSpan: 4,
          z: 1,
        }));
      }
      if ( Math.random() < 0.02 ) {
        // Sparks
        parts.push(new Particle({
          start: {
            x: 500 + xo * 40, y: 700,
            r: 255, g: Math.random() * 160,
            radius: 3,
          },
          end: {
            x: x + Math.random() * 250 - 125, y: Math.random()*200 + 200,
            alpha: 0,
          },
          lifeSpan: 1.5,
          z: 1,
        }));
      }
      // Fire
      var radius = Math.random()*20+20;
      parts.push(new Particle([
        {
          x: 500 + xo * 40, y: 720-radius,
          r: 255, g: Math.random() * 160,
          radius,
        },
        {
          x: 500 + xo * 40 + swayX * 50, y: Math.random()*200 + 300,
          bx: 500 + xo * 150 - swayX * 20, by: 600,
          alpha: 0,
        },
      ], {z: Math.floor(Math.random() * 10)}));
      // Blue
      if ( Math.random() < 0.4 ) {
        parts.push(new Particle([
          {
            x: 500 + xo * 10, y: 740-radius,
            r: 128, g: Math.random() * 160, b: 255,
            alpha: 0,
            radius,
            duration: 0.2,
          },
          {alpha: 0.06},
          {
            x: 500 + xo * 10, y: 500, bx: 500 + xo * 80,
            alpha: 0,
          }
        ], {z: Math.floor(Math.random()*4+7)}));
      }
      return parts;
    }
  },
  {
    name: "rainbow bug box",
    times: 15,
    particles: () => {
      var x = Math.random()*200 + 400, y = Math.random()*200 + 400;
      return new Particle({
        start: {
          x, y,
          radius: 3,
          ...rCol(),
        },
        end: {
          x: Math.random()*200 + 400, y: Math.random()*200 + 400,
          radius: Math.random()*5+5,
          alpha: 0,
        },
        lifeSpan: 1,
        optimizeColors: 64,
      });
    },
  },
  {
    name: "wormhole",
    particles: () => {
      var rad = Math.random() * Math.PI * 2;
      return new Particle({
        start: {
          x: 500, y: 500,
          g: Math.random()*256, b: 255,
          radius: 2,
        },
        end: {
          x: 500 + Math.cos(rad) * 150, y: 500 + Math.sin(rad) * 150,
          radius: 300,
          alpha: 0,
        },
        lifeSpan: 6,
      })
    }
  },
  {
    name: "space",
    particles: () => {
      var rad = Math.random() * Math.PI * 2;
      return new Particle({
        start: {
          x: 500 + Math.cos(rad) * 5, y: 500 + Math.sin(rad) * 5,
          r: 255, g: 255, b: 255,
          radius: 2,
          alpha: 0.05,
        },
        end: {
          x: 500 + Math.cos(rad) * 710, y: 500 + Math.sin(rad) * 710,
          radius: 5,
          alpha: 4,
        }
      })
    }
  },
];