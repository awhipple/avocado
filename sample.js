import Particle from "./node_modules/avocado2d/gfx/shapes/Particle.js";
import Avocado from "./node_modules/avocado2d/engine/GameEngine.js"
import GameObject from "./node_modules/avocado2d/objects/GameObject.js";

window.onload = function() {
  (new Game()).start();
};

var ship;

export default class Game {
  constructor(options = {}) {
    this.avo = new Avocado({
      width: 1000,
      height: 1000,
      bgColor: "black",
      border: "3px solid black",
      ...options
    });
  }

  start() {
    ship = new Ship(this.avo);
    this.avo.register(ship);

    this.avo.onUpdate(() => {
      if ( Math.random() < 0.01 ) {
        this.avo.register(new Enemy(this.avo));
      }

      this.avo.register(new Particle([
        {x: Math.random() * 1000, y: -100, r: 255, g: 255, b: 255, radius: 3, duration: 5},
        {y: 1100}
      ], {z: 0}));
    });
  }
  
}

class Ship extends GameObject {
  z = 1;
  constructor(avo) {
    super(avo, {x: 450, y: 900, w: 100, h: 50});
  
    avo.onMouseMove(evt => {
      this.x = evt.pos.x;
    });

    avo.onMouseDown(evt => {
      avo.register(new Laser(avo, this.x, this.y), "laser");
    });

    this.ship = avo.images.get("ship");
  }

  update() {
    this.engine.register(new Particle([
      {x: this.x, y: this.y + 10, radius: 5, r: 255, g: Math.random() * 200, duration: 0.4},
      {x: this.x + Math.random() * 50 - 25, y: this.y + 65, alpha: 0}
    ], {z: 0}));
  }

  draw(ctx) {
    this.ship.draw(ctx, this.rect);
  }
}

class Laser extends GameObject {
  constructor(avo, x, y) {
    super(avo, {x, y, radius: 8});
  }

  update() {
    this.y -= 10;

    if ( this.offScreen(100) ) {
      this.engine.unregister(this);
    }

    this.engine.register(new Particle([
      {x: this.x, y: this.y + 10, radius: 15, b: 255, g: Math.random() * 200},
      {x: this.x + Math.random() * 50 - 25, y: this.y + 65, alpha: 0, radius: 0}
    ], {z: 0}));
  }
}

class Enemy extends GameObject {
  z = 1;

  constructor(avo) {
    super(avo, {x: Math.random() * 1000, y: -100, radius: 50});
    
    this.onCollision(target => {
      avo.unregister(this);
      avo.unregister(target);

      for ( var i = 0; i <= 25; i++ ) {
        avo.register(new Particle([
          {x: this.x, y: this.y, g: 128 + Math.random() * 128, duration: Math.random() + 1},
          {x: ship.x, y: ship.y, radius: 5, bx: Math.random() * 1000, by: Math.random() * 1000}
        ]));
      }
    }, "laser");

    this.img = avo.images.get("enemy");
  }

  update() {
    this.y++;

    if ( this.offScreen(200) ) {
      this.engine.unregister(this);
    }
  }

  draw(ctx) {
    this.img.draw(ctx, this.rect);
  }
}
