# Avocado

Avocado is a 2d javascript canvas based game engine, written entirely by Aaron Whipple. It's designed to be simple to use, unobtrusive, and to give you as much control over your game loop as possible.

On the command line execute the following in your project directory.

`npm install avocado2d`

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
