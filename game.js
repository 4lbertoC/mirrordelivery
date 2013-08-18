// Initialization
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
	isMoving: false,
	verticalSpeed: 0,
	images: {
		standing: null
	}
}

var Map = [];

var Environment = {
	Truck: {
		image: null,
		position: [5, 340]
	},
	DeliveryPoint: {
		image: null,
		position: [0, 0]
	}
}

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
	I = CANVAS_WIDTH / BLOCK_SIZE,
	J = CANVAS_HEIGHT / BLOCK_SIZE;
Map.length = I * J;
for (i = 0; i < I; i++) {
	for (j = 0; j < J; j++) {
		Map[I * j + i] = BLOCK_TYPE.EMPTY;
	}
}

// Build Player
var a = Player.images.standing = new Image();
a.width = 16;
a.height = 32;
a.src = 'man.png';

// Build Environment
a = Environment.Truck.image = new Image();
a.width = 80;
a.height = 48;
a.src = 'truck.png';

for (i = 960; i < 1000; i++) {
	Map[i] = BLOCK_TYPE.SOLID;
}

Map[940] = BLOCK_TYPE.SOLID;
Map[941] = BLOCK_TYPE.SOLID;
Map[900] = BLOCK_TYPE.SOLID;
Map[901] = BLOCK_TYPE.SOLID;
// Map[1437] = BLOCK_TYPE.LADDER;
// Map[1387] = BLOCK_TYPE.LADDER;
// Map[1337] = BLOCK_TYPE.LADDER;
// Map[1338] = BLOCK_TYPE.SOLID;

// Main Functions

function processInput(t) {
	var speed = Player.speed,
		x = Player.position[0],
		y = Player.position[1],
		k = KeyHandler.k;
	if (k[37]) { // LEFT
		Player.position[0] = Math.max(BLOCK_SIZE, x - speed);
		Player.isMoving = true;
	}
	if (k[38]) {
		if (isPlayerOverBlock(BLOCK_TYPE.LADDER)) {
			Player.position[1] = Math.min(CANVAS_HEIGHT, y - speed);
			Player.isMoving = true;
		} else if (!Player.isJumping && !Player.isInAir) { // UP
			Player.verticalSpeed = 10;
			Player.isJumping = true;
			Player.isInAir = true;
		}
	} else if (!k[38] && Player.isJumping) {
		Player.isJumping = false;
	}
	if (k[39]) { // RIGHT
		Player.position[0] = Math.min(CANVAS_WIDTH - BLOCK_SIZE, x + speed);
		Player.isMoving = true;
	}
	if (k[40] && isPlayerOverBlock(BLOCK_TYPE.LADDER)) { // DOWN
		Player.position[1] = Math.min(CANVAS_HEIGHT, y + speed);
		Player.isMoving = true;
	}
	if (!k[37] && !k[38] && !k[39] && !k[40]) {
		Player.isMoving = false;
	}
}

function isPlayerOverBlock(blockType) {
	if (Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE)] === blockType ||
		Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE + 1)] === blockType) {
		return true;
	}
	return false;
}

function update(t) {
	// Player jumping
	if (isPlayerOverBlock(BLOCK_TYPE.LADDER) || (!Player.isJumping && isPlayerOverBlock(BLOCK_TYPE.SOLID))) {
		Player.verticalSpeed = 0;
		Player.isInAir = false;
		Player.position[1] = Player.position[1] + (Player.position[1] % BLOCK_SIZE);
	} else if (Player.position[1] < CANVAS_HEIGHT - BLOCK_SIZE) {
		Player.verticalSpeed -= 1;
	}
	Player.position[1] = Math.min(CANVAS_HEIGHT - BLOCK_SIZE, Player.position[1] - Player.verticalSpeed);
}

// Drawing functions

function clearColor(color) {
	ctx.setFillColor(color || 'black');
	ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function drawMap() {
	for (i = 0; i < I; i++) {
		for (j = 0; j < J; j++) {
			if (Map[I * j + i] === BLOCK_TYPE.EMPTY) {
				ctx.setFillColor('00deff');
			} else if (Map[I * j + i] === BLOCK_TYPE.SOLID) {
				ctx.setFillColor('green');
			} else if (Map[I * j + i] === BLOCK_TYPE.LADDER) {
				ctx.setFillColor('green');
			}
			ctx.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		}
	}
}

function drawEnvironment() {
	var truck = Environment.Truck;
	ctx.drawImage(truck.image, truck.position[0], truck.position[1]);
}

function drawPlayer() {
	ctx.drawImage(Player.images.standing, Player.position[0] + 8, Player.position[1] - 24);
}

function logging() {
	ctx.setFillColor('red');
	ctx.fillText("(" + Player.position[0] + ', ' + Player.position[1] + ')', 10, 20);
	ctx.fillText("Vert speed: " + Player.verticalSpeed, 10, 10);
	ctx.fillText(I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE), 10, 30);
	ctx.fillText(Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE)], 10, 40);
}

function render(t) {
	clearColor();
	drawMap();
	drawEnvironment();
	drawPlayer();
	logging();
}

(function gameLoop(t) {
	processInput(t);
	update(t);
	render(t);

	window.requestAnimationFrame(gameLoop);
})();