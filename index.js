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

    this.avo.images.preload(["spark", "face"]);

    this.currentEffect = 0;
    this.frameCount = 0;

    var div = document.createElement("div");
    div.style = "padding:50px;position: absolute; top: 0"
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
    // window.avo = this.avo;
    // this.engine.setProd();
  }

  start() {
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
var effects = [
  {
    name: "face parade",
    every: 60,
    times: 1,
    particles: () => {
      var anim = [ { x: -100, y: 500, radius: 20, g: 255, duration: 3 } ];
      var rot = 0;
      for ( var i = 0; i < 8; i++ ) {
        rot += Math.PI*3*Math.random() + 0.1;
        anim.push({dir: [rot, "easeBoth"], duration: 0.5});
        rot -= Math.PI*3*Math.random() + 1;
        anim.push({dir: [rot, "easeBoth"], duration: 0.5});
      }
      anim.push({ dir: [6.28, "easeBoth"], x: 1100, radius: 60 + Math.random() * 40, r: 128, g: 0, b: [255, "easeIn"] });
      return new Particle(anim, { imgName: "face" });
    }
  },
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
        {y: [1010, "easeOut"], alpha: 1},
      ], {
        imgName: Math.random() < 0.5 ? "spark" : "",
      });
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
    name: "sweep",
    times: 7,
    particles: () => {
      var rad = Math.random()*Math.PI*2;
      var spreadRadius = 200;
      var r = Math.random(), g = Math.random(), b = Math.random();
      return new Particle([
        {x: 400, y: 1025, r: 50, g: 255, b: 225, radius: 20, duration: 0.5},
        {duration: Math.random() * 2},
        {
          r: r * 64, g: g * 80, b: b * 256, radius: 50, duration: 0.5
        },
        {
          r: r * 256, g: g * 256, b: b * 256, duration: 0.5,
        },
        {
          x: [750 + Math.cos(rad) * spreadRadius * Math.random(), "easeIn"], y: [600 + Math.sin(rad) * spreadRadius * Math.random(), "easeIn"],
          bx: -200 + Math.cos(rad) * spreadRadius, by: -400 + Math.sin(rad) * spreadRadius,
          radius: 0,
        }
      ]);
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
    every: 3,
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
    ]),
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
    times: 3,
    particles: () => {
      var parts = [];
      var x = Math.random()*200 + 400;
      if ( Math.random() < 0.06) {
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
        }));
      }
      if ( Math.random() < 0.3 ) {
        // Sparks
        parts.push(new Particle({
          start: {
            x, y: 700,
            r: 255, g: Math.random() * 160,
            radius: 3,
          },
          end: {
            x: x + Math.random() * 160 - 80, y: Math.random()*200 + 300,
            alpha: 0,
          },
          lifeSpan: 1,
        }));
      }
      // Fire
      var radius = Math.random()*20+20;
      parts.push(new Particle({
        start: {
          x, y: 720-radius,
          r: 255, g: Math.random() * 160,
          radius,
          alpha: 0.2,
        },
        lifeSpan: 2,
      }));
      parts.push(new Particle({
        start: {
          x, y: 720-radius,
          r: 255, g: Math.random() * 160,
          radius,
        },
        end: {
          x: (x-500)*0.5+500, y: Math.random()*200 + 400,
          alpha: 0,
        },
        lifeSpan: 1,
      }));
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