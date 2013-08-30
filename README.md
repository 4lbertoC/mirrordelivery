MIRROR DELIVERY
===============
#### A 13kB game by Alberto Congiu for [js13kgames 2013](http://js13kgames.com/)

#### [Play](http://albertocongiu.com/mirrordelivery)

### DESCRIPTION

Mirror Delivery is a competitive local HTML5 game for 2 players.

*Player 1* interprets **Luke**, a delivery boy who has to deliver some crates full of of mirrors to an old lady (from now on called "Granny").

*Player 2* plays the **Crow**, an animal that enjoys annoying the delivery boys
that pass nearby. Unfortunately for him, Granny hates crows. Her shotgun is
ready to knock down any bird whose feather color is darker than #1f261c.



### MECHANICS

#### Luke

> ###### Breaking a mirror brings seven years of bad luck, and you have to deliver a crate full of them (forewarned is forearmed).
  
Luke can grab crates and carry them across the level. If he falls from too
high, the crate breaks. Each crate have a number on it that indicates its
weight. The heavier the crate, the slower Luke is when carrying it and the
lower is the height from which it breaks if he falls.
Crates break also if Luke is hit by animals.
Luke can buy up to three candies from the dispensers, and use them to have
a speed boost for five seconds. When he eats a candy, crumbs are left on the
ground.
Granny doesn't tolerate delays, so Luke has a limited time to deliver all
the crates.

#### Crow

> ###### Crows are strong, but killing a bird is generally not advisable.

The Crow likes to shoot on the head of Luke to make his crate fall and break.
It can ready up to three shots, by eating from the food stock in his nest(s).
If he finds some delicious candy crumbs left on the ground, it can eat them and
instantly have five shots.
The Crow has to be careful because he is not the only hunter. The Granny hates
him and her shotgun is a real danger. She is very slow at aiming, but doesn't
miss a shot. To avoid being shot, the Crow can hide inside its nest.
It also has to be careful not to fly over roofs or too near to Luke, as he can
reach it too!
When the Crow is hit, it loses all his shots, and it's stunned for five seconds,
in which he can move but cannot eat or shoot.

#### Black Cat

> ###### Black cats. Do I need to say anything else?

If Luke breaks too many crates or the Crow is stunned too many times, a Black
Cat will appear. It will start jumping around, and it will hit any of the
players that touch it.
Moreover, Granny gets scared by the Cat's presence, and she gets faster at
aiming as the time passes.

### CONTROLS

#### Player 1 (Luke, the delivery boy)

  Desktop  |  Mobile   |  Action
:-----------|------------:|:------------:
Arrows  |  Arrows   |  Move and jump, climb ladders
	 Spacebar |     I     |  Grab/release crates, buy candies from dispensers
	     E    |     E     |  Eat candy
	    Esc   |     X     |  Quit level

#### Player 2 (The Crow)

  Desktop  |  Mobile   |  Action
:-----------|------------:|:------------:
	  Mouse   | Analog Pad |  Move and jump, climb ladders
	 Left btn |     S     |  Shoot
	Right btn |     A     |  Eat from the nest or the candy crumbs

#### Edit Mode

  Desktop  |  Mobile   |  Action
:-----------|------------:|:------------:
	  Mouse   | Analog Pad |  Move cursor
	<- -> arrows| <- -> arrows|  Select element to draw
	 Left btn |     S     |  Draw
	          |     A     |  Toggle auto-draw when moving
	     C    |     C     |  Change the number and value of the crates
	     T    |     T     |  Change the time limit
	     N    |     N     |  Change the name of the level
	    Esc   |     X     |  Quit editing

#### Menu

  Desktop  |  Mobile   |  Action
:-----------|------------:|:------------:
	<- -> arrows| <- -> arrows|  Select the level
	     E    |     E     |  Edit the level (or create a new one from base level)
	     I    |     I     |  Imports a level by entering its JSON
	     J    |     A     |  Export the current level in JSON format
	     D    |     S     |  Delete current level



### PROJECT STRUCTURE

I decided to sacrifice cleanliness and OO structure to have instead more features
on the game.
There are no classes, but instead a lot of function definitions.
Since the algorithm used by zip compression tends to optimize repetitive chunks
of data, some of the functions are not refactored to gain some (preciousss) bytes.
This has the disadvantage that the unpacked code is bigger, and the game slower to
load. And, obviously, it's a lot more painful to read and understand (sorry).

On the final phases, I was going up and down the limit of 13312 bytes (in a range
of ~10bytes!), and sometimes cutting away pieces of code had the result of having
a bigger final package.

#### Libraries
The only external library that I use is JSFX to dynamically create sounds.
I have modified and optimized it for advanced minification.

#### Minification
To minify the code I use [Closure Compiler](https://developers.google.com/closure/compiler/)

I use externs for jsfx, otherwise the Compiler would complain that it doesn't
find some symbols.

#### Graphics
I used TexturePacker to create the texture atlas, then I modified and imported
the JSON map to include only the data that I need, plus adding information about
animation frames.

To draw mirrored images, like Luke going left, I create during initialization
a new canvas in which I draw the mirrored map, and then use this map with also
mirrored coordinates.

The game is tile-based, and everything is redrawn entirely at each cycle on the
canvas (I preferred to save bytes for something else).

#### Level Editor
Each level of the game can be edited and shared.

#### Server
I made a test with some server APIs to push your custom Levels on the cloud and
share them by appending a hash to the URL, but storing data on files is
problematic on some service providers, and using databases requires heavy
libraries.
I dropped this feature and now I just show the JSON inside a prompt dialog.

#### Compatibility
I tested the game with Chrome (on Mac OS, Windows and Android), Firefox,
IE10 (on a Windows 7 desktop and a Windows 8 tablet) and Safari on iPad 2.
In order to play the game on touch enabled devices, I show an overlay with
the buttons to control both Luke and the Crow. This works as long as the device
has multitouch support.

#### Code sections
The code is divided into:

- Constants
- Variables
- Helper functions (cross-browser issues, device detection)
- Game mechanics functions
- Game loop functions

Each section is organized into smaller parts, each relative to a specific
component of the game (graphics, audio, input, etc...)

#### Game loop
The game loop uses requestAnimationFrame, and is divided in the three phases of
input processing, state update and rendering. You can find it at the bottom of the
file, and that's basically the entry point to the entire code.

#### Build
To build the package, just run `build.sh`