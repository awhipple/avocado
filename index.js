import Avocado from "./engine/GameEngine.js";
import Particle from "./engine/gfx/shapes/Particle.js";

window.onload = function() {
  (new Game()).start();
};

export default class Game {
  constructor(options = {}) {
    this.avo = new Avocado({
      width: 1000,
      height: 1000,
      bgColor: "#000",
      ...options
    });

    this.currentEffect = 0;

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
    this.avo.load().then(() => {
      this.avo.onUpdate(() => {
        var effect = effects[this.currentEffect];
        this.avo.register(effect.particles(), "particle");
      });
    });
  }

  setEffect(val) {
    this.avo.unregister("particle");
    this.currentEffect = val;
  }

}

var galRotate = 0;
var effects = [
  {
    name: "galaxy",
    particles: () => {
      var parts = [];
      for ( var i = 0; i < 4; i++ ) {
        var rad = Math.random() * Math.PI * 2;
        var [r, g, b] = Math.random() < 0.05 ? [Math.random()*256, Math.random()*256, Math.random()*256] : [255, 255, 255];
        if ( rad % (Math.PI/2) < 0.7) {
          parts.push(new Particle(null, {
            start: {
              x: 500, y: 500,
              r, g, b,
              radius: 3,
              alpha: 0.1,
            },
            end: {
              x: 500 + Math.cos(rad + galRotate) * 300, y: 500 + Math.sin(rad + galRotate) * 150,
              radius: Math.random()*5+5,
              alpha: 1,
            },
            lifeSpan: 20,
          }));
          galRotate += 0.004;
        }
      }
      if ( Math.random() < 0.08 ) {
        parts.push(new Particle(null, {
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
    particles: () => {
      var parts = [];
      for ( var i = 0; i < 3; i++ ) {
        var x = Math.random()*200 + 400;
        if ( Math.random() < 0.06) {
          // Smoke
          parts.push(new Particle(null, {
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
          parts.push(new Particle(null, {
            start: {
              x, y: 700,
              r: 255, g: Math.random() * 160,
              radius: 3,
              alpha: 1,
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
        parts.push(new Particle(null, {
          start: {
            x, y: 720-radius,
            r: 255, g: Math.random() * 160,
            radius,
            alpha: 0.2,
          },
          lifeSpan: 2,
        }));
        parts.push(new Particle(null, {
          start: {
            x, y: 720-radius,
            r: 255, g: Math.random() * 160,
            radius,
            alpha: 1,
          },
          end: {
            x: (x-500)*0.5+500, y: Math.random()*200 + 400,
            alpha: 0,
          },
          lifeSpan: 1,
        }));
      }
      return parts;
    }
  },
  {
    name: "rainbow bug box",
    particles: () => {
      var parts = [];
      for ( var i = 0; i < 15; i++ ) {
        var x = Math.random()*200 + 400, y = Math.random()*200 + 400;
        parts.push(new Particle(null, {
          start: {
            x, y,
            r: Math.random()*256, g: Math.random()*256, b: Math.random()*256,
            radius: 3,
            alpha: 1,
          },
          end: {
            x: Math.random()*200 + 400, y: Math.random()*200 + 400,
            radius: Math.random()*5+5,
            alpha: 0,
          },
          lifeSpan: 1,
        }));
      }
      return parts;
    }
  },
  {
    name: "whirlpool",
    particles: () => {
      var rad = Math.random() * Math.PI * 2;
      return new Particle(null, {
        start: {
          x: 500, y: 500,
          g: Math.random()*256, b: 255,
          radius: 2,
          alpha: 1,
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
      return new Particle(null, {
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