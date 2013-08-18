// Initialization
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;


var canvas = document.getElementById('c'),
	ctx = canvas.getContext('2d');

// CONSTANTS
var CANVAS_WIDTH = 500,
	CANVAS_HEIGHT = 300;

var BLOCK_TYPE = {
	EMPTY: 0,
	SOLID: 1,
	LADDER: 2
}

// The Player class
var Player = {
	position: [100, 100],
	speed: 3,
	isJumping: false,
	isInAir: false,
	verticalSpeed: 0
}

var Map = [];

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

// Initialization
// Build Map
var i = 0,
	j = 0,
	I = CANVAS_WIDTH / 10,
	J = CANVAS_HEIGHT / 10;
Map.length = I * J;
for (i = 0; i < I; i++) {
	for (j = 0; j < J; j++) {
		Map[I * j + i] = BLOCK_TYPE.EMPTY;
	}
}

for (i = 1450; i < 1550; i++) {
	Map[i] = BLOCK_TYPE.SOLID;
}

Map[1435] = BLOCK_TYPE.SOLID;
Map[1436] = BLOCK_TYPE.SOLID;
Map[1437] = BLOCK_TYPE.LADDER;
Map[1387] = BLOCK_TYPE.LADDER;
Map[1337] = BLOCK_TYPE.LADDER;
Map[1338] = BLOCK_TYPE.SOLID;

// Main Functions

function processInput(t) {
	var speed = Player.speed,
		x = Player.position[0],
		y = Player.position[1],
		k = KeyHandler.k;
	if (k[37]) { // LEFT
		Player.position[0] = Math.max(0, x - speed);
	}
	if (k[38]) {
		if (isPlayerOverBlock(BLOCK_TYPE.LADDER)) {
			Player.position[1] = Math.min(CANVAS_HEIGHT, y - speed);
		} else if (!Player.isJumping && !Player.isInAir) { // UP
			//Player.position[1] = Math.max(0, y - speed);
			Player.verticalSpeed = 10;
			console.log('jumping')
			Player.isJumping = true;
			Player.isInAir = true;
		}
	} else if (!k[38] && Player.isJumping) {
		Player.isJumping = false;
		console.log('stop jumping')
	}
	if (k[39]) { // RIGHT
		Player.position[0] = Math.min(CANVAS_WIDTH, x + speed);
	}
	if (k[40] && isPlayerOverBlock(BLOCK_TYPE.LADDER)) { // DOWN
		Player.position[1] = Math.min(CANVAS_HEIGHT, y + speed);
	}
}

function isPlayerOverBlock(blockType) {
	if (Map[I * Math.round(Player.position[1] / 10) + Math.round(Player.position[0] / 10)] === blockType) {
		return true;
	}
	return false;
}

function update(t) {
	// Player jumping
	if (isPlayerOverBlock(BLOCK_TYPE.LADDER) || (!Player.isJumping && isPlayerOverBlock(BLOCK_TYPE.SOLID))) {
		Player.verticalSpeed = 0;
		Player.isInAir = false;
	} else if (Player.position[1] < CANVAS_HEIGHT - 10) {
		Player.verticalSpeed -= 1;
	}
	Player.position[1] = Math.min(CANVAS_HEIGHT - 10, Player.position[1] - Player.verticalSpeed);
}

// Drawing functions

function clearColor(color) {
	ctx.setFillColor(color || 'black');
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawPlayer() {
	ctx.setFillColor('red');
	ctx.fillRect(Player.position[0], Player.position[1], 5, 5);
}

function drawMap() {
	for (i = 0; i < I; i++) {
		for (j = 0; j < J; j++) {
			if (Map[I * j + i] === BLOCK_TYPE.EMPTY) {
				ctx.setFillColor('black');
			} else if (Map[I * j + i] === BLOCK_TYPE.SOLID) {
				ctx.setFillColor('blue');
			} else if (Map[I * j + i] === BLOCK_TYPE.LADDER) {
				ctx.setFillColor('green');
			}
			ctx.fillRect(i * 10, j * 10, 10, 10);
		}
	}
}

function logging() {
	ctx.setFillColor('red');
	ctx.fillText("(" + Player.position[0] + ', ' + Player.position[1] + ')', 10, 20);
	ctx.fillText("Vert speed: " + Player.verticalSpeed, 10, 10);
	ctx.fillText(I * Math.round(Player.position[1] / 10) + Math.round(Player.position[0] / 10), 10, 30);
	ctx.fillText(Map[I * Math.round(Player.position[1] / 10) + Math.round(Player.position[0] / 10)], 10, 40);
}

function render(t) {
	clearColor();
	drawMap();
	drawPlayer();
	logging();
}

(function gameLoop(t) {
	processInput(t);
	update(t);
	render(t);

	window.requestAnimationFrame(gameLoop);
})();