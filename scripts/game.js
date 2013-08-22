/*
 *
 * Variable Initialization
 *
 */

var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;


var canvas = document.getElementById('c'),
	ctx = canvas.getContext('2d');

// CONSTANTS
var CANVAS_WIDTH = 640,
	CANVAS_HEIGHT = 400,
	BLOCK_SIZE = 16;

var BLOCK_TYPE = {
	EMPTY: '0',
	SOLID: '1',
	LADDER: '2',
	ROOF: '3',
	STATUS_BAR: '4',
	GOAL: '5',
	NEST: '6',
	DISPENSER: '7'
};

var SOUND_TYPE = {
	JUMP: 0,
	PLAYER_CRASH: 1,
	CROW_SHOT: 2,
	CROW_CRASH: 3,
	CRATE_PICKUP: 4,
	CRATE_DELIVERY: 5,
	SUCCESS: 6,
	FAILURE: 7,
	SPEED_BOOST: 8,
	CROW_EAT: 9,
	DISPENSER: 10,
	GRANNY_SHOT: 11
};

var MAX_CRATES = 3,
	MIN_CRATE_SIZE = 1,
	CRATE_SIZE_INCREMENT = 1,
	CRATE_WIDTH = 12,
	CRATE_POSITION_OFFSET = [1, -6],
	MIN_VERTICAL_SPEED_TO_CRASH = 12;

var SPEED_BOOST = 3,
	SPEED_BOOST_TIMEOUT = 5000,
	PLAYER_WARNING_RADIUS = 75,
	PLAYER_DAMAGE_RADIUS = 25,
	PLAYER_RADIUS_MULTIPLIER = 7,
	DISPENSER_CANDIES = 3;

var NEST_SHOTS = 3,
	CRUMBS_SHOTS = 5,
	CROW_STUN_TIME = 5000;

var LASER_SPEED = 1.5,
	LASER_MOVEMENT_THRESHOLD = 3;

var GAME_TIME = 300000,
	STARTING_PLAYER_POSITION = [75, 370],
	STARTING_CROW_POSITION = [CANVAS_WIDTH - 24, 24],
	STARTING_LASER_POSITION = [95, 78];
INTRO_THEME = '023123467'.split('');

var KEYCODES = {
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	EAT: 69,
	INTERACT: 32
}

/*
 *
 * The game objects
 *
 */

var Player = {
	position: null,
	speed: 4,
	currentSpeed: 0,
	speedBoost: 0,
	speedBoostTimeout: 0,
	ladderSpeed: 2,
	jumpSpeed: -7,
	isJumping: false,
	isInAir: false,
	isMoving: false,
	isInteracting: false,
	verticalSpeed: 0,
	images: {
		standing: null
	},
	wasOverSolidBlock: false,
	crateCarried: undefined,
	candies: 3
};

var Crow = {
	position: null,
	images: {
		flying: null
	},
	shots: NEST_SHOTS,
	isInWarningZone: false,
	stunnedTimeout: 0
};

var Map = [];

var Environment = {
	Ladder: {
		image: null
	},
	Nest: {
		image: null
	},
	Dispenser: {
		image: null
	},
	Roof: {
		image: null
	},
	Wall: {
		image: null
	}
};

var Crate = {
	image: null,
	size: 1,
	position: null,
	startPosition: null
};
var CratesArray = [];

var Crumbs = {
	image: null,
	position: null
};
var CrumbsArray = [];

var Shot = {
	image: null,
	position: null,
	speed: 6
};
var ShotsArray = [];

var Game = {
	started: false,
	canvasBoundingRect: canvas.getBoundingClientRect(),
	time: 0,
	boyPoints: 0,
	crowPoints: 0
};

var InstructionCanvas = document.createElement('canvas');

var Laser = {
	position: null
}

var Granny = {
	position: [80, 53],
	image: null
}

/*
 *
 * Input initialization
 *
 */
// Key Handling
var KeyHandler = {
	k: {},

	onKeyUp: function (event) {
		KeyHandler.k[event['keyCode']] = undefined;
	},

	onKeyDown: function (event) {
		KeyHandler.k[event['keyCode']] = Date.now();
	}
};
window.addEventListener('keyup', KeyHandler.onKeyUp, false);
window.addEventListener('keydown', KeyHandler.onKeyDown, false);

/*
 *
 * Audio
 *
 */
var _NOTES_CDEFGABC = [
        523.25,
        587.33,
        659.26,
        698.46,
        783.99,
        880.00,
        987.77,
        1046.50,
        1108.73
    ];

var introTheme = {};
for (var s = 0; s < _NOTES_CDEFGABC.length; s++) {
	introTheme[s] = jsfxlib.createWave(["synth", 0.0000, 0.4000, 0.0000, 0.2080, 0.0000, 0.1200, 20.0000, _NOTES_CDEFGABC[s], 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.1000, 0.0000]);
}
var introThemeString = INTRO_THEME.slice();

function playNextNote() {
	introTheme[introThemeString.shift()]['play']();
	if (introThemeString.length > 0) {
		setTimeout(playNextNote, 200);
	}
}

var Sounds = {};

function loadSound(name, data) {
	Sounds[name] = jsfxlib.createWave(data);
}
loadSound(SOUND_TYPE.JUMP, ["square", 0.0000, 0.4000, 0.0000, 0.1740, 0.0000, 0.2800, 20.0000, 497.0000, 2400.0000, 0.2200, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0665, 0.0000, 0.0000, 0.0000, 0.0000, 0.7830, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.PLAYER_CRASH, ["noise", 0.0000, 0.4000, 0.0000, 0.1400, 0.4050, 0.1160, 20.0000, 479.0000, 2400.0000, -0.0700, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, -0.0860, -0.1220, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.CRATE_DELIVERY, ["square", 0.0000, 0.4000, 0.0000, 0.0980, 0.5040, 0.2820, 20.0000, 1582.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.SPEED_BOOST, ["saw", 0.0000, 0.4000, 0.0000, 0.3240, 0.0000, 0.2840, 20.0000, 631.0000, 2400.0000, 0.1720, 0.0000, 0.4980, 19.3500, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.CROW_SHOT, ["saw", 0.0000, 0.4000, 0.0000, 0.2120, 0.0000, 0.0280, 20.0000, 1169.0000, 2400.0000, -0.5200, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.5000, -0.5920, 0.0000, 0.0940, 0.0660, 1.0000, 0.0000, 0.0000, 0.2800, 0.0000]);
loadSound(SOUND_TYPE.FAILURE, ["synth", 0.0000, 0.4000, 0.0000, 0.3200, 0.3480, 0.4400, 20.0000, 372.0000, 417.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.3740, 0.2640, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.SUCCESS, ["square", 0.0000, 0.4000, 0.0000, 0.3200, 0.3480, 0.4400, 20.0000, 1521.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.3740, 0.2640, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.CRATE_PICKUP, ["noise", 0.0000, 0.4000, 0.0000, 0.0020, 0.0240, 0.0900, 20.0000, 372.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, -0.3420, 0.8090, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.CROW_CRASH, ["noise", 0.0000, 0.4000, 0.0000, 0.1520, 0.3930, 0.2740, 20.0000, 839.0000, 2400.0000, -0.3100, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, -0.3400, 0.7830, 0.0000, 0.0000, 0.6096, 0.5260, -0.0080, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.CROW_EAT, ["square", 0.0000, 0.4000, 0.0000, 0.0400, 0.0000, 0.0480, 20.0000, 578.0000, 2400.0000, 0.1040, 0.0000, 0.6830, 19.1580, 0.0003, 0.0000, 0.0000, 0.0000, 0.3850, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.DISPENSER, ["square", 0.0000, 0.4000, 0.0000, 0.0460, 0.4770, 0.2400, 20.0000, 1197.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.4980, 0.2040, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
loadSound(SOUND_TYPE.GRANNY_SHOT, ["noise", 0.0000, 0.4000, 0.0000, 0.1080, 0.3360, 0.1240, 20.0000, 462.0000, 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);

function playSound(soundName) {
	if (Sounds[soundName]) {
		Sounds[soundName]['pause']();
		Sounds[soundName]['currentTime'] = 0;
		Sounds[soundName]['play']();
	}
}

/*
 *
 * Game Objects Initialization
 *
 */

// Build Map
var i = 0,
	j = 0,
	I = CANVAS_WIDTH / BLOCK_SIZE,
	J = CANVAS_HEIGHT / BLOCK_SIZE;

function initImage(src, width, height) {
	var img = new Image();
	img.width = width || 16;
	img.height = height || 16;
	img.src = src;
	return img;
}

// Build Player
Player.images.standing = initImage('img/man.png', 16, 32);

// Build Crow
Crow.images.flying = initImage('img/crow.png');

// Build Environment
Environment.Ladder.image = initImage('img/ladder.png');
Environment.Nest.image = initImage('img/nest.png');
Environment.Dispenser.image = initImage('img/dispenser.png');
Environment.Roof.image = initImage('img/roof.png');
Environment.Wall.image = initImage('img/wall.png');

// Build Crumbs
Crumbs.image = initImage('img/crumbs.png');

// Build Shot
Shot.image = initImage('img/shot.png');

// Build Granny
Granny.image = initImage('img/granny.png');


function printText(context, textArray, x, y, yIncrement) {
	var textArrayCopy = textArray.slice(),
		tempY = y;
	while (textArrayCopy.length > 0) {
		context.fillText(textArrayCopy.shift(), x, tempY);
		tempY += yIncrement;
	}
}

function reset() {
	Game.started = false;
	Player.position = STARTING_PLAYER_POSITION.slice();
	Crow.position = STARTING_CROW_POSITION.slice();
	Laser.position = STARTING_LASER_POSITION.slice();

	// Build Crates
	var currentCrateSize = MIN_CRATE_SIZE,
		newCrate,
		crateCanvas,
		crateCtx,
		x,
		y;

	CratesArray.length = 0;
	for (var cr = 0; cr < MAX_CRATES; cr++) {
		var newCrate = Object.create(Crate);
		newCrate.size = currentCrateSize;

		crateCanvas = document.createElement('canvas');
		crateCanvas.width = CRATE_WIDTH + currentCrateSize;
		crateCanvas.height = CRATE_WIDTH + currentCrateSize;
		crateCtx = crateCanvas.getContext('2d');
		crateCtx.setFillColor('yellow');
		crateCtx.fillRect(0, 0, CRATE_WIDTH + currentCrateSize, CRATE_WIDTH + currentCrateSize);
		crateCtx.setFillColor('black');
		crateCtx.fillText(currentCrateSize, 5, 10);
		newCrate.image = crateCanvas;

		x = 85 + currentCrateSize * 15;
		y = 365 - currentCrateSize;
		newCrate.position = [x, y];
		newCrate.startPosition = [x, y];

		CratesArray.push(newCrate);
		currentCrateSize += CRATE_SIZE_INCREMENT;
	}

	InstructionCanvas.width = CANVAS_WIDTH;
	InstructionCanvas.height = CANVAS_HEIGHT;
	var icCtx = InstructionCanvas.getContext('2d');
	icCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	icCtx.font = '12px sans-serif';
	icCtx.setFillColor('rgba(0,0,0,0.7)');
	icCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	icCtx.setFillColor('fff');
	icCtx.fillText("Click the crow to start!", CANVAS_WIDTH - 170, 25);

	var boyInstructions = [
	'Delivery Boy must deliver all the boxes to the green goal.',
	'If you fall from too high, the box will break, and it is returned to start position.',
	'Use arrows to move and jump, SPACEBAR to take/leave boxes, E to eat speed candies.',
	'Speed candies leave crumbs on the ground.'
];
	var crowInstructions = [
	'Crow must hinder Delivery Boy from delivering all the boxes.',
	'Move with mouse, left click to shoot and right click to collect food.',
	'Food recharges shots and is found in the nest and crumbs left by Delivery Boy.',
	'Don\'t touch roofs and don\'t get too close to Delivery Boy or you\'ll get stunned.',
	'Oh, and don\'t get shot!'
];
	printText(icCtx, boyInstructions, 140, 330, 13);
	icCtx['textAlign'] = 'right';
	printText(icCtx, crowInstructions, 440, 30, 13);
	icCtx.font = '20px sans-serif';
	icCtx['textAlign'] = 'center';
	icCtx.fillText('Delivery Boy ' + Game.boyPoints + ' - ' + Game.crowPoints + ' Crow', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
	icCtx['beginPath']();
	icCtx['arc'](CANVAS_WIDTH - 25, 25, 16, 0, 360);
	icCtx['lineWidth'] = 1;
	icCtx['strokeStyle'] = 'fff';
	icCtx['stroke']();

	introThemeString = INTRO_THEME.slice();
}

reset();

// Helper functions

function getCanvasRelativeCoords(evt) {
	return [evt.clientX - Game.canvasBoundingRect.left, evt.clientY - Game.canvasBoundingRect.top];
}

function getPlayerSpeed() {
	return Math.max(1, Player.speed + Player.speedBoost - (Player.crateCarried !== undefined ? CratesArray[Player.crateCarried].size : 0));
}

// Add Mouse Event Listener
canvas.addEventListener('click', function (evt) {
	var currentMousePosition = getCanvasRelativeCoords(evt);
	if (!Game.started) {
		if (currentMousePosition[0] > CANVAS_WIDTH - 36 && currentMousePosition[1] < 36) {
			Game.started = true;
			Game.time = Date.now() + GAME_TIME;
			playNextNote();

			canvas['style']['cursor'] = 'none';
		}
	} else if (Crow.shots > 0 && Crow.stunnedTimeout < Date.now()) {
		Crow.shots--;
		playSound(SOUND_TYPE.CROW_SHOT);
		var newShot = Object.create(Shot);
		newShot.position = Crow.position.slice();
		ShotsArray.push(newShot);
	}
});

canvas.addEventListener('mousemove', function (evt) {
	if (Game.started) { // Update the crow's position
		var newCrowPosition = getCanvasRelativeCoords(evt);
		Crow.position = newCrowPosition.slice();
	}
});

canvas.addEventListener('contextmenu', function (evt) {
	evt.preventDefault();
	if (Game.started && Crow.stunnedTimeout < Date.now()) {
		var currentMousePosition = getCanvasRelativeCoords(evt);
		if (isCrowOverBlock(BLOCK_TYPE.NEST) && Crow.shots < NEST_SHOTS) {
			playSound(SOUND_TYPE.CROW_EAT);
			Crow.shots++;
		} else {
			var c;
			for (c = 0; c < CrumbsArray.length; c++) {
				if (arePositionsInSameBlock(currentMousePosition, CrumbsArray[c].position)) {
					Crow.shots = Math.max(Crow.shots, CRUMBS_SHOTS);
					playSound(SOUND_TYPE.CROW_EAT);
					CrumbsArray.splice(c, 1);
					return;
				}
			}
		}
	}
});


// Build Dummy Map
Map = '4444444444444444444444444444444444444444' +
	'3333330000000000000000000000000000000060' +
	'5555530000000000000000000000000000000011' +
	'5555500000000000000000000033330000000000' +
	'5555500000000000000200000000000000000000' +
	'1111110010011001111201110011110000000000' +
	'0000000000000000000200000000001000000000' +
	'0000000000000000070200000000000100000000' +
	'0001110000000000111111000000000010020000' +
	'0020000000000000333333300003333301021000' +
	'0020003333330000000000000000000000020000' +
	'0020000000000000000000000000000000020000' +
	'0020000000000000100100100110000202020000' +
	'0020111111111111100000003331100111121110' +
	'0020033333333330000000000003300000033333' +
	'0020000000000000000000000000000000000000' +
	'0020000000000000000020000000000002000000' +
	'0020111100111110011120111001111112011111' +
	'0020000000000000000020000000000002000000' +
	'0020000000000000000020700000000002000000' +
	'0000333330000000000011110000200002000000' +
	'0000000000000000000000000000211112000000' +
	'0000000000000000000000000000200000000000' +
	'1111111111111111111111111111111111111111' +
	'4444444444444444444444444444444444444444' +
	''.split('');

/*
 *
 * Main Functions
 *
 */

function getMapAt(x, y) {
	return Map[I * y + x];
}

function setMapAt(value, x, y) {
	Map[I * y + j] = value;
}

function arePositionsInSameBlock(pos1, pos2) {
	return (Math.round(pos1[0] / BLOCK_SIZE) === Math.round(pos2[0] / BLOCK_SIZE)) && (Math.round(pos1[1] / BLOCK_SIZE) === Math.round(pos2[1] / BLOCK_SIZE));
}

function interact() {
	var currentCrateIdx = Player.crateCarried,
		currentCrate = currentCrateIdx !== undefined ? CratesArray[currentCrateIdx] : undefined;
	if (currentCrate === undefined) {
		var obj,
			c;
		for (c = 0; c < CratesArray.length; c++) {
			if (arePositionsInSameBlock(Player.position, CratesArray[c].position)) {
				Player.crateCarried = c;
				playSound(SOUND_TYPE.CRATE_PICKUP);
				return;
			}
		}
		// If no crate is picked up, use dispenser
		if (isPlayerOnBlock(BLOCK_TYPE.DISPENSER)) {
			Player.candies = DISPENSER_CANDIES;
			playSound(SOUND_TYPE.DISPENSER);
		}
	} else {
		Player.crateCarried = undefined;
		playSound(SOUND_TYPE.CRATE_PICKUP);
		if (isPlayerOnBlock(BLOCK_TYPE.GOAL) && currentCrate !== undefined) {
			playSound(SOUND_TYPE.CRATE_DELIVERY);
			CratesArray.splice(currentCrateIdx, 1);
			if (CratesArray.length <= 0) {
				Game.boyPoints += 1;
				canvas['style']['cursor'] = 'auto';
				playSound(SOUND_TYPE.SUCCESS);
				reset();
			}
		}
	}
}

function calculateLeftRightSpeed(t) {
	var currentSpeed = Player.currentSpeed,
		speed = getPlayerSpeed();
	if (!Player.isMoving) {
		currentSpeed = 0;
	}
	currentSpeed = Math.min(speed, currentSpeed + speed / 5);
	Player.currentSpeed = currentSpeed;
	return (isPlayerOnBlock(BLOCK_TYPE.LADDER) ? speed / 3 : currentSpeed);
}

function processInput(t) {
	if (!Game.started) return;
	var speed = getPlayerSpeed(),
		ladderSpeed = Player.ladderSpeed,
		x = Player.position[0],
		y = Player.position[1],
		k = KeyHandler.k;

	if (k[KEYCODES.INTERACT] && !Player.isJumping && !Player.isInAir && !Player.isInteracting) { // SPACEBAR
		Player.isInteracting = true;
		interact();
	} else if (k[KEYCODES.EAT] && !Player.isInteracting) { // E
		Player.isInteracting = true;
		if (Player.candies > 0) {
			Player.candies--;
			Player.speedBoost = SPEED_BOOST;
			Player.speedBoostTimeout = Date.now() + SPEED_BOOST_TIMEOUT;
			var newCrumbs = Object.create(Crumbs);
			newCrumbs.position = [Player.position[0] + 4, Player.position[1] - 7];
			CrumbsArray.push(newCrumbs);

			playSound(SOUND_TYPE.SPEED_BOOST);
		}
	} else if (!k[KEYCODES.INTERACT] && !k[KEYCODES.EAT] && Player.isInteracting) {
		Player.isInteracting = false;
	}
	if (k[KEYCODES.UP]) { // UP
		if (isPlayerOnBlock(BLOCK_TYPE.LADDER)) {
			Player.position[1] = Math.min(CANVAS_HEIGHT - BLOCK_SIZE, y - ladderSpeed);
			Player.isMoving = true;
		} else if (!Player.isJumping && !Player.isInAir) {
			Player.verticalSpeed = Player.jumpSpeed;
			Player.currentSpeed = speed;
			Player.isJumping = true;
			Player.isInAir = true;
			playSound(SOUND_TYPE.JUMP);
		}
	} else if (!k[KEYCODES.UP] && Player.isJumping) {
		Player.isJumping = false;
	}
	if (k[KEYCODES.LEFT]) { // LEFT
		Player.position[0] = Math.max(BLOCK_SIZE, x - calculateLeftRightSpeed(t));
		Player.isMoving = true;
	}
	if (k[KEYCODES.RIGHT]) { // RIGHT
		Player.position[0] = Math.min(CANVAS_WIDTH - 2 * BLOCK_SIZE, x + calculateLeftRightSpeed(t));
		Player.isMoving = true;
	}
	if (k[KEYCODES.DOWN] && (isPlayerOnBlock(BLOCK_TYPE.LADDER) || isPlayerOverBlock(BLOCK_TYPE.LADDER)) && !isPlayerOverBlock(BLOCK_TYPE.SOLID)) { // DOWN
		Player.position[1] = Math.min(CANVAS_HEIGHT, y + ladderSpeed);
		Player.isMoving = true;
	}
	if (!k[KEYCODES.LEFT] && !k[KEYCODES.UP] && !k[KEYCODES.RIGHT] && !k[KEYCODES.DOWN]) {
		Player.isMoving = false;
	}
}

function isPlayerOverBlock(blockType) {
	if (!arePositionsInSameBlock(Player.position, [Player.position[0], Player.position[1] + BLOCK_SIZE / 2]) && (getMapAt(Math.round(Player.position[0] / BLOCK_SIZE - 1), Math.round(Player.position[1] / BLOCK_SIZE)) === blockType ||
		getMapAt(Math.round(Player.position[0] / BLOCK_SIZE), Math.round(Player.position[1] / BLOCK_SIZE)) === blockType)) {
		return true;
	}
	return false;
}

function isCrowOverBlock(blockType) {
	if ((getMapAt(Math.round(Crow.position[0] / BLOCK_SIZE - 0.5), Math.round(Crow.position[1] / BLOCK_SIZE - 0.5)) === blockType)) {
		return true;
	}
	return false;
}

function isPositionOnBlock(position, blockType) {
	if ((getMapAt(Math.round(position[0] / BLOCK_SIZE - 0.5), Math.round(position[1] / BLOCK_SIZE - 1)) === blockType)) {
		return true;
	}
	return false;
}

function isPlayerOnBlock(blockType) {
	return isPositionOnBlock(Player.position, blockType);
}

function isPlayersBlockOverBlock(blockType) {
	if (getMapAt(Math.round(Player.position[0] / BLOCK_SIZE), Math.round(Player.position[1] / BLOCK_SIZE)) === blockType ||
		getMapAt(1), Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE) === blockType) {
		return true;
	}
	return false;
}

function squareDistance(pos1, pos2) {
	return Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2);
}

function getWarningRadius() {
	return getPlayerSpeed() * PLAYER_RADIUS_MULTIPLIER + PLAYER_WARNING_RADIUS;
}

function getDamageRadius() {
	return getPlayerSpeed() * PLAYER_RADIUS_MULTIPLIER + PLAYER_DAMAGE_RADIUS;
}

function isCrowInPlayerWarningZone() {
	return Math.pow(getWarningRadius(), 2) >= squareDistance(Crow.position, Player.position);
}

function isCrowInPlayerDamageZone() {
	return Math.pow(getDamageRadius(), 2) >= squareDistance(Crow.position, Player.position);
}

function getCurrentCrate() {
	return Player.crateCarried !== undefined ? CratesArray[Player.crateCarried] : undefined;
}

function getDirectionAngle(origin, destination) {
	return Math.atan((destination[1] - origin[1]) / (destination[0] - origin[0]));
}

function breakCurrentCrate() {
	var currentCrate = getCurrentCrate();
	if (currentCrate) {
		playSound(SOUND_TYPE.PLAYER_CRASH);
		Player.crateCarried = undefined;
		currentCrate.position = currentCrate.startPosition.slice();
	}
}

function checkIfCurrentCrateBreaks() {
	var currentCrate = getCurrentCrate();
	if (currentCrate) {
		var verticalSpeedThreshold = MIN_VERTICAL_SPEED_TO_CRASH - currentCrate.size;
		if (Player.verticalSpeed > verticalSpeedThreshold) {
			breakCurrentCrate();
		}
	}
}

function stunCrow(t) {
	Crow.stunnedTimeout = t + CROW_STUN_TIME;
	playSound(SOUND_TYPE.GRANNY_SHOT);
	Crow.shots = 0;
}

function getPlayerNearestSolidBlockY() {
	var playerX = Player.position[0],
		currentBlockY = Player.position[1];
	while (currentBlockY < CANVAS_HEIGHT - BLOCK_SIZE) {
		if (isPositionOnBlock([playerX, currentBlockY], BLOCK_TYPE.SOLID)) {
			break;
		}
		currentBlockY += BLOCK_SIZE;
	}
	currentBlockY = currentBlockY - (currentBlockY % BLOCK_SIZE);
	return currentBlockY;
}

function update(t) {
	if (!Game.started) {
		return;
	}
	// Updating Canvas position
	Game.canvasBoundingRect = canvas.getBoundingClientRect();

	// Player jumping
	// var nextY = Player.verticalSpeed;
	// Player.position[1] = Player.position[1] + nextY;
	if (Player.verticalSpeed > BLOCK_SIZE / 2 && (Player.verticalSpeed + Player.position[1]) > Player.nearestSolidBlockY && Player.verticalSpeed) {
		Player.verticalSpeed = BLOCK_SIZE / 2;
		checkIfCurrentCrateBreaks();
	}
	if (isPlayerOnBlock(BLOCK_TYPE.LADDER) || isPlayerOverBlock(BLOCK_TYPE.LADDER) || isPlayerOverBlock(BLOCK_TYPE.SOLID) || Player.position[1] > CANVAS_HEIGHT - BLOCK_SIZE) {
		if (isPlayerOverBlock(BLOCK_TYPE.LADDER) || Player.verticalSpeed > 0) {
			checkIfCurrentCrateBreaks();
			Player.verticalSpeed = 0;
			Player.currentSpeed = 0;
			Player.isInAir = false;
		}
		if ((!isPlayerOnBlock(BLOCK_TYPE.LADDER) && !isPlayerOverBlock(BLOCK_TYPE.LADDER)) && Player.verticalSpeed === 0) {
			Player.position[1] = Player.position[1] - (Player.position[1] % BLOCK_SIZE) + 1;
		}
	} else {
		// if (Player.verticalSpeed > 0 && Player.wasOverSolidBlock) {
		// 	checkIfCurrentCrateBreaks();
		// 	Player.verticalSpeed = BLOCK_SIZE / 3;
		// }
		checkIfCurrentCrateBreaks();
		Player.verticalSpeed += 1;
		Player.isInAir = true;
	}
	Player.position[1] = Player.position[1] + Player.verticalSpeed;
	// TODO remove wasOverSolidBlock
	// Player.wasOverSolidBlock = isPlayersBlockOverBlock(BLOCK_TYPE.SOLID);
	Player.nearestSolidBlockY = getPlayerNearestSolidBlockY();

	// Crate carried
	if (Player.crateCarried !== undefined) {
		CratesArray[Player.crateCarried].position[0] = Player.position[0] + CRATE_POSITION_OFFSET[0];
		CratesArray[Player.crateCarried].position[1] = Player.position[1] + CRATE_POSITION_OFFSET[1];
	}

	// Speed boost timeout check
	if (Player.speedBoostTimeout < t && Player.speedBoost > 0) {
		Player.speedBoost = 0;
	}

	// Update shots position
	var s;
	for (s = 0; s < ShotsArray.length; s++) {
		var curShot = ShotsArray[s];
		curShot.position[1] += curShot.speed;
		if (arePositionsInSameBlock(Player.position, curShot.position)) {
			breakCurrentCrate();
			ShotsArray.splice(s, 1);
			s--;
		} else if (curShot.position[1] > CANVAS_HEIGHT || isPositionOnBlock(curShot.position, BLOCK_TYPE.ROOF)) {
			// TODO Destroy roof?
			ShotsArray.splice(s, 1);
			s--;
		}
	}

	// Check Game Time
	if (Game.time < t) {
		Game.crowPoints += 1;
		canvas['style']['cursor'] = 'auto';
		playSound(SOUND_TYPE.FAILURE);
		reset();
	}

	// Check if Crow is inside player's radius
	Crow.isInWarningZone = isCrowInPlayerWarningZone();

	// Update Laser's position
	var laserTargetPosition = isPositionOnBlock(Crow.position, BLOCK_TYPE.NEST) ? STARTING_LASER_POSITION : Crow.position,
		laserToCrowAngle = getDirectionAngle(Laser.position, laserTargetPosition),
		tangentSide = Laser.position[0] > laserTargetPosition[0] ? -1 : 1;
	if (Math.abs(laserTargetPosition[0] - Laser.position[0]) > LASER_MOVEMENT_THRESHOLD || Math.abs(laserTargetPosition[1] - Laser.position[1]) > LASER_MOVEMENT_THRESHOLD) {
		Laser.position[0] += Math.cos(laserToCrowAngle) * tangentSide * LASER_SPEED;
		Laser.position[1] += Math.sin(laserToCrowAngle) * tangentSide * LASER_SPEED;
	}

	if ((isCrowInPlayerDamageZone() || isPositionOnBlock(Crow.position, BLOCK_TYPE.ROOF) || Math.sqrt(squareDistance(Laser.position, Crow.position)) < LASER_MOVEMENT_THRESHOLD) && Crow.stunnedTimeout < t) {
		stunCrow(t);
	}
}

// Drawing functions

function clearColor(color) {
	ctx.setFillColor(color || 'black');
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawMap() {
	var color,
		image;
	for (i = 0; i < I; i++) {
		for (j = 0; j < J; j++) {
			image = null;
			color = '00deff';
			if (getMapAt(i, j) === BLOCK_TYPE.EMPTY) {} else if (getMapAt(i, j) === BLOCK_TYPE.SOLID) {
				image = Environment.Wall.image;
			} else if (getMapAt(i, j) === BLOCK_TYPE.ROOF) {
				image = Environment.Roof.image;
			} else if (getMapAt(i, j) === BLOCK_TYPE.STATUS_BAR) {
				color = '000';
			} else if (getMapAt(i, j) === BLOCK_TYPE.GOAL) {
				color = '0f0';
			} else if (getMapAt(i, j) === BLOCK_TYPE.NEST) {
				image = Environment.Nest.image;
			} else if (getMapAt(i, j) === BLOCK_TYPE.LADDER) {
				image = Environment.Ladder.image;
			} else if (getMapAt(i, j) === BLOCK_TYPE.DISPENSER) {
				image = Environment.Dispenser.image;
			} else {
				color = 'fff';
			}
			ctx.setFillColor(color);
			ctx.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
			if (image !== null) {
				ctx.drawImage(image, i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
			}
		}
	}
}

function drawEnvironment() {
	var cur, cr;
	for (cr = 0; cr < CratesArray.length; cr++) {
		cur = CratesArray[cr];
		ctx.drawImage(cur.image, cur.position[0] - 8, cur.position[1] - 8);
	}
	for (cr = 0; cr < CrumbsArray.length; cr++) {
		cur = CrumbsArray[cr];
		ctx.drawImage(cur.image, cur.position[0] - 8, cur.position[1] - 8);
	}
	for (cr = 0; cr < ShotsArray.length; cr++) {
		cur = ShotsArray[cr];
		ctx.drawImage(cur.image, cur.position[0] - 8, cur.position[1] - 8);
	}

	ctx.drawImage(Granny.image, Granny.position[0], Granny.position[1]);
}

function drawPlayer() {
	ctx.drawImage(Player.images.standing, Player.position[0] - 8, Player.position[1] - 24);

	if (Crow.isInWarningZone) {
		ctx['beginPath']();
		ctx['arc'](Player.position[0], Player.position[1], getDamageRadius(), 0, 360);
		ctx['lineWidth'] = 2;
		ctx['strokeStyle'] = 'f09';
		ctx['stroke']();
	}
}

function drawCrow(t) {
	if (!(Crow.stunnedTimeout > t && Math.floor(t / 100) % 2 === 0)) {
		ctx.drawImage(Crow.images.flying, Crow.position[0] - 8, Crow.position[1] - 8);
	}
	ctx.setFillColor('red');
}

function drawLaser() {
	ctx.setFillColor('red');
	ctx.fillRect(Laser.position[0] - 1, Laser.position[1] - 1, 2, 2);
	ctx['beginPath']();
	ctx['arc'](Laser.position[0], Laser.position[1], 5, 0, 360);
	ctx['lineWidth'] = 2;
	ctx['strokeStyle'] = 'red';
	ctx['stroke']();
}

function drawStatus(t) {
	ctx.setFillColor('00deff');
	ctx.fillText("BOY", 10, 396);
	ctx.setFillColor('red');
	ctx.fillText("CROW", 600, 12);
	ctx.setFillColor('white');

	// Boy's status
	ctx.fillText("SPEED: " + getPlayerSpeed(), 40, 396);
	ctx.fillText("BOOST TIMEOUT: " + Math.max(0, Math.ceil((Player.speedBoostTimeout - t) / 1000)), 100, 396);
	ctx.fillText("TIME LEFT: " + Math.max(0, Math.ceil((Game.time - t) / 1000)), 210, 396);
	ctx.fillText("CANDIES: " + Player.candies, 300, 396);

	// Crow's status
	ctx.fillText("SHOTS: " + Crow.shots, 540, 12);
	ctx.fillText("STUN: " + Math.max(0, Math.ceil((Crow.stunnedTimeout - t) / 1000)), 480, 12);

	// Logs to be removed
	// ctx.setFillColor('red');
	// ctx.fillText(Player.nearestSolidBlockY, 10, 10);
	// ctx.fillText("Dist: " + squareDistance(Crow.position, Player.position) + ', Warn: ' + getWarningRadius(), 10, 10);
	// ctx.fillText("(" + Player.position[0] + ', ' + Player.position[1] + ')', 10, 20);
	// ctx.fillText("Vert speed: " + Player.verticalSpeed, 10, 10);
	// ctx.fillText(I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE), 10, 30);
	// ctx.fillText(getMapAt(Math.round(Player.position[0, Math.round(Player.position[1] / BLOCK_SIZE)) / BLOCK_SIZE)], 10, 40);
	// ctx.fillText("Crow Position: (" + Crow.position[0] + ', ' + Crow.position[1] + ")", 10, 50);
}

function render(t) {
	clearColor();
	drawMap();
	drawPlayer();
	drawEnvironment();
	drawCrow(t);
	drawLaser();
	drawStatus(t);
	if (!Game.started) {
		ctx.drawImage(InstructionCanvas, 0, 0);
	}
}

(function gameLoop(t) {
	processInput(t);
	update(t);
	render(t);

	window.requestAnimationFrame(gameLoop);
})();