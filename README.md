# Avocado

Avocado is a 2d javascript canvas based game engine, written entirely by Aaron Whipple. It supports Chrome on Windows, Mac, and Android. It's designed to be simple to use, unobtrusive, and to give you as much control over your game loop as possible.

On the command line execute the following in your project directory.

```
npm install avocado2d
cp ./node_modules/avocado2d/template/* .
```

Note: The 2nd command is not necessary, but will provide you with some starter files to get up and running. Use these as an example to work Avocado into a pre existing project.

Instantiate an instance of the game engine. This is already done if you use the template files from above.

```javascript
var avo = new Avocado( {
  width: 1000,
  height: 1000,
  bgColor: "#000",
} );
```

Instantiate a game object with your init code.

````javascript
var circle = new Circle({x: 500, y: 500}, 30);
avo.register(circle);
````

At this point you should have a black game screen in the middle of the page with a blue circle in the middle.

Add the following to your init code.

```javascript
avo.onUpdate(() => {
  circle.x++;
});
```

You should now see the circle moving slowly toward the right side of the screen.

## Game Objects

In the example above, the circle we created is a game object. Avocado contains a number of useful ready to use game objects, but the bulk of a game will likely be made up of developer defined game objects.

To register a game object, use `avo.register(object)`. From this point on, the game engine will manage the object for you, and no action needs to be taken from your game loop.

You can also optionally provide a name for the object type, which can later be used to fetch sub collections of objects.

```javascript
avo.register(object, "enemy"); // Tags our new game object with the label "enemy".
avo.getObjects("enemy"); // Returns an array containing all game objects with the tag "enemy".
avo.unregister(object); // Removes the object from the game.
```

###### Initialization

When a game object is registered, a few things happen.

* The object has its `on` property set to `true`
* The object has its `engine` property set to reference the engine
* If the object is a `Particle` (see below), it gets labeled with "particle" in addition to a user defined label

###### Properties

* `on`: The object's `update` method is only called when `on === true`
* `hide`: The object's `draw` method is only called when `hide === false`
* `z`: This controls the draw order of your objects. Higher z values appear over lower ones. It also controls click handling, directing which object intercepts your click first.

###### Methods

A game object is just any object that may optionally have the following methods.

* `update()`: As long as `obj.on === true`, this method is called a guaranteed 60 times per second.
* `draw(ctx)`: As long as `obj.hide === false`, this method is called as often as possible. `ctx` is the game canvas context, and gives you full control over how you want the object to draw.

###### GameObject class

There is a `GameObject` class in `./objects/GameObject.js` which is a helper for your game objects. Using it is totally optional.

You can instantiate a raw game object without your own customizations.

`avo.register(new GameObject(avo, shape));`

You can also extend `GameObject` to build your own custom objects.

```javascript
class MyObject extends GameObject {
  constructor(...) {
    super(avo, shape);
  }
}
```

`shape` is an object that determines your game object's starting rectangle. You can either provide `x`, `y`, `w`, and `h`, which will define the rect with `x`, `y` defining the top left of the object and `w`, `h` defining the width and height of its rectangle, or you can define it with `x`, `y`, and `radius` in which case `x`, `y` will define the center of the object, and `radius` will define the width and height of the rectangle as `2 * radius`.

###### Methods

Your game object will have the following methods.

* `offscreen(by = 0)`: Returns true if game object has left the screen. You can specify `by` to only return true when the object has gone a certain distance off the screen. This can be nice to handle some objects auto de registering off screen, like projectiles.
* `onCollision(callback, target = "all")`: Sets a callback method to call whenever this object overlaps any other game object with label "all". Note that "all" is a special label that will cause a collision with any other game object. The callback should receive an object, which will be a reference to the colliding object.
* `lineIntercept(x, y, dir)`: Tests if a line starting at point x, y, and moving in direction `dir`, defined in radians, and returns the coordinates of that collision. Returns false if there is no overlap. This could be used to determine bullet trajectory collisions.
* `draw(ctx)`: Draws your game object as a rectangle. This is used primarily for testing, showing your game object before you've defined your own draw method. It can also be called as `super.draw(ctx)` from your own draw method to give your object a collision box behind it to help debug.

###### Getters

There are getters for some special properties, that are managed by the setters below.

* `x`: Returns the center X position of the object.
* `y`: Returns the center Y position of the object.
* `pos`: Returns (x, y) as a `Coord` object.
* `rect`: The objects rectangle as a `Rectangle` object.
* `radius`: Returns the radius of an object.
* `originX`: Returns the left X position of the object.
* `originY`: Returns the top Y position of the object.
* `screenRect`: Returns a `Rectangle` that represents the objects apparent position on the screen. This reflects the objects normal rect unless the objects `cam` property is set to a `Camera` object.

###### Setters

All properties listed above in "getters" can be set directly, and the game object will appropriately update all the other values with the change.

## Keyboard Input

## Mouse Input

## Image Library

## Audio Library

## Game Math

## Particle Engine

Avocado includes a graphical particle engine. This can be used to create a variety of dynamically defined effects.

#### Usage

Include `Particle.js` from the `engine/gfx/shapes` folder.

Instantiate a particle and register it with the game engine.

`engine.register(new Particle(transitions))`

#### Instantiation

On instantiation, pass your new particle an array of transitions.

Transition Schema:

```javascript
[ 
  {
    x: int?, y: int?,
    bx: int?, by: int?,
    radius: int?,
    r: int?, g: int?, b: int?,
    alpha: int?,
    duration: int?,
  }, 
  {...
]
```

You can pass 1 or more transition objects to the new particle. This will serve as the roadmap for the particle, animating it according to the attributes you select.

Transition Properties:


| Name | default | Range | Description |
| - | - | - | - |
| x | 50 | (-∞, ∞) | The horizontal screen position of the particle, starting from the left at 0. |
| y | 50 | (-∞, ∞) | The vertical screen position of the particle, starting from the top at 0. |
| radius | 50 | (-∞, ∞) | The radius of the particle. 0 means the particle won't appear. |
| r | 0 | [0, 255] | The amount of red in the particle. |
| g | 0 | [0, 255] | The amount of green in the particle. |
| b | 0 | [0, 255] | The amount of blue in the particle. |
| alpha | 1 | [0, 1] | The opacity of the object. 0 is invisible. |
| bx | - | (-∞, ∞) | Read below for more details on Bezier curves. |
| by | - | (-∞, ∞) | Read below for more details on Bezier curves. |
| duration | - | [0, ∞) | The time in seconds to make it to the next transition state. |

#### Missing Values

Notice how all these properties are marked above as optional. Any transition can contain any subset of values. In the case that the first transition object lacks a particular property, it will take on the default value. Subsequent missing values will interpolate smoothly across the transitions until the next transition that contains it.

Ex.

```javascript
[
  { x: 500, y: 500, g: 255 },
  { g: 0, duration: 3 },
  { y: 0, alpha: 0 },
]
```

In this case, the particle starts at (500, 500) with a green hue. Because no duration is provided in the first transition it will take one second for the green to fade to the black from transition 2. After this it will start animating toward the 3rd transition, moving and fading linearly to (500, 0) over the course of 3 seconds.

#### Bezier Curves

A Bezier curve allows a particle to follow a curved path. `bx` and `by` are not standard transition properties, as they define the curve for a change to `x` and `y` in the same transition, but they themselves do not transition, or affect the position of particles in subsequent transitions.

Read more here to figure out how to place your Bezier point to get a curve.

[https://javascript.info/bezier-curve]()

#### Transition Functions

By default, all properties transition linearly across time. You can specify a transition function if you would like to change this behavior. Instead of passing an integer to a transition value, give it a two item array.

`{ x: [500, "easeIn"], y: [0, "easeOut"], alpha: [1, "easeBoth"] }`

You can also specify a custom transition function. In general, these functions are intended to map [0, 1] -> [0, 1]. If you want particles to change in a continuous fashion, make `f(0) = 0` and `f(1) = 1` and make sure your function is continuous.

Heres a manual example of `"easeIn"`.

`x: [500, d => Math.sin(d * Math.PI / 2)]`

Here's how `"easeBoth"` works.

```
d => {
      var dist = Math.pow((0.5-Math.abs(0.5-d))/0.5, 2)*0.5
      return d < 0.5 ? dist : 1 - dist;
    }
```
