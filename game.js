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

var suoni = {};
for (var s = 0; s < _NOTES_CDEFGABC.length; s++) {
	suoni[s] = jsfxlib['createWave'](["synth", 0.0000, 0.4000, 0.0000, 0.2080, 0.0000, 0.1200, 20.0000, _NOTES_CDEFGABC[s], 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.1000, 0.0000]);
}
var theme = '023123467'.split('');

function playNextNote() {
	suoni[theme.shift()]['play']();
	if (theme.length > 0) {
		setTimeout(playNextNote, 200);
	}
}
setTimeout(playNextNote, 1000);

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
	position: [180, 350],
	speed: 5,
	ladderSpeed: 2,
	jumpSpeed: -7,
	isJumping: false,
	isInAir: false,
	isMoving: false,
	verticalSpeed: 0,
	images: {
		standing: null
	},
	wasOverSolidBlock: false
}

var Crow = {
	position: [CANVAS_WIDTH - 36, 20],
	images: {
		flying: null
	}
}

var Map = [];

var Environment = {
	Truck: {
		image: null,
		position: [5, 330]
	},
	DeliveryPoint: {
		image: null,
		position: [0, 0]
	}
}

// Game Objects
var Game = {
	started: false,
	canvasBoundingRect: canvas.getBoundingClientRect()
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

// Build Crow
a = Crow.images.flying = new Image();
a.width = 16;
a.height = 16;
a.src = 'crow.png';

// Helper functions

function getCanvasRelativeCoords(evt) {
	return [evt.clientX - Game.canvasBoundingRect.left, evt.clientY - Game.canvasBoundingRect.top];
}

// Add Mouse Event Listener
canvas.addEventListener('click', function (evt) {
	var currentMousePosition = getCanvasRelativeCoords(evt);
	if (!Game.started && currentMousePosition[0] > CANVAS_WIDTH - 36 && currentMousePosition[1] < 36) {
		Game.started = true;

		canvas['style']['cursor'] = 'none';
		canvas.addEventListener('mousemove', function (evt) {
			// Update the crow's position
			var newCrowPosition = getCanvasRelativeCoords(evt);
			Crow.position[0] = newCrowPosition[0];
			Crow.position[1] = newCrowPosition[1];
		});
	}
});


// Build Dummy Map
for (i = 920; i < 960; i++) {
	Map[i] = BLOCK_TYPE.SOLID;
}

Map[900] = BLOCK_TYPE.SOLID;
Map[901] = BLOCK_TYPE.SOLID;
Map[902] = BLOCK_TYPE.LADDER;
Map[862] = BLOCK_TYPE.LADDER;
Map[822] = BLOCK_TYPE.LADDER;
Map[782] = BLOCK_TYPE.LADDER;
Map[742] = BLOCK_TYPE.LADDER;
Map[702] = BLOCK_TYPE.LADDER;
Map[662] = BLOCK_TYPE.LADDER;
Map[622] = BLOCK_TYPE.LADDER;
Map[582] = BLOCK_TYPE.LADDER;
Map[621] = BLOCK_TYPE.SOLID;
Map[620] = BLOCK_TYPE.SOLID;
Map[619] = BLOCK_TYPE.SOLID;
Map[618] = BLOCK_TYPE.LADDER;
Map[578] = BLOCK_TYPE.LADDER;
Map[538] = BLOCK_TYPE.LADDER;
Map[783] = BLOCK_TYPE.SOLID;
Map[784] = BLOCK_TYPE.SOLID;
Map[785] = BLOCK_TYPE.SOLID;
Map[786] = BLOCK_TYPE.SOLID;
Map[790] = BLOCK_TYPE.SOLID;
Map[791] = BLOCK_TYPE.SOLID;
Map[792] = BLOCK_TYPE.SOLID;
Map[793] = BLOCK_TYPE.SOLID;
// Map[823] = BLOCK_TYPE.SOLID;
// Map[824] = BLOCK_TYPE.SOLID;
// Map[1437] = BLOCK_TYPE.LADDER;
// Map[1387] = BLOCK_TYPE.LADDER;
// Map[1337] = BLOCK_TYPE.LADDER;
// Map[1338] = BLOCK_TYPE.SOLID;

// Main Functions

function processInput(t) {
	if (!Game.started) return;
	var speed = Player.speed,
		ladderSpeed = Player.ladderSpeed,
		x = Player.position[0],
		y = Player.position[1],
		k = KeyHandler.k;
	if (k[37]) { // LEFT
		Player.position[0] = Math.max(BLOCK_SIZE, x - speed);
		Player.isMoving = true;
	}
	if (k[38]) { // UP
		if (isPlayerOnBlock(BLOCK_TYPE.LADDER)) {
			Player.position[1] = Math.min(CANVAS_HEIGHT - BLOCK_SIZE, y - ladderSpeed);
			Player.isMoving = true;
		} else if (!Player.isJumping && !Player.isInAir) {
			Player.verticalSpeed = Player.jumpSpeed;
			Player.isJumping = true;
			Player.isInAir = true;
		}
	} else if (!k[38] && Player.isJumping) {
		Player.isJumping = false;
	}
	if (k[39]) { // RIGHT
		Player.position[0] = Math.min(CANVAS_WIDTH - 2 * BLOCK_SIZE, x + speed);
		Player.isMoving = true;
	}
	if (k[40] && isPlayerOnBlock(BLOCK_TYPE.LADDER) && !isPlayerOverBlock(BLOCK_TYPE.SOLID)) { // DOWN
		Player.position[1] = Math.min(CANVAS_HEIGHT, y + ladderSpeed);
		Player.isMoving = true;
	}
	if (!k[37] && !k[38] && !k[39] && !k[40]) {
		Player.isMoving = false;
	}
}

function isPlayerOverBlock(blockType) {
	if ((Math.round(Player.position[1] / BLOCK_SIZE) !== Math.round((BLOCK_SIZE / 2 + Player.position[1]) / BLOCK_SIZE)) && (Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE)] === blockType ||
		Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE + 1)] === blockType)) {
		return true;
	}
	return false;
}

function isPlayerOnBlock(blockType) {
	if ((Map[I * Math.round(Player.position[1] / BLOCK_SIZE - 1) + Math.round(Player.position[0] / BLOCK_SIZE)] === blockType ||
		Map[I * Math.round(Player.position[1] / BLOCK_SIZE - 1) + Math.round(Player.position[0] / BLOCK_SIZE + 1)] === blockType)) {
		return true;
	}
	return false;
}

function isPlayersBlockOverBlock(blockType) {
	if (Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE)] === blockType ||
		Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE + 1)] === blockType) {
		return true;
	}
	return false;
}

function getPlayerIntersections() {

}

function update(t) {
	// Updating Canvas position
	Game.canvasBoundingRect = canvas.getBoundingClientRect();

	// Player jumping
	// var nextY = Player.verticalSpeed;
	// Player.position[1] = Player.position[1] + nextY;
	if (isPlayerOnBlock(BLOCK_TYPE.LADDER) || isPlayerOverBlock(BLOCK_TYPE.SOLID)) {
		if (Player.verticalSpeed > 0 || isPlayerOverBlock(BLOCK_TYPE.LADDER)) {
			Player.verticalSpeed = 0;
			Player.isInAir = false;
		}
		// if (!isPlayerOverBlock(BLOCK_TYPE.LADDER)) {
		// 	Player.position[1] = Player.position[1] - (Player.position[1] % BLOCK_SIZE);
		// }
	} else {
		if (Player.verticalSpeed > 0 && Player.wasOverSolidBlock) {
			Player.verticalSpeed = BLOCK_SIZE / 3;
		}
		Player.verticalSpeed += 1;
		Player.isInAir = true;
	}
	Player.position[1] = Player.position[1] + Player.verticalSpeed;
	Player.wasOverSolidBlock = isPlayersBlockOverBlock(BLOCK_TYPE.SOLID);
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
				ctx.setFillColor('brown');
			}
			ctx.fillRect(i * BLOCK_SIZE, j * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		}
	}
}

function drawEnvironment() {
	var truck = Environment.Truck;
	ctx.drawImage(truck.image, truck.position[0], truck.position[1]);
	if (!Game.started) {
		ctx.setFillColor('red');
		ctx.fillText("Click the crow to start!", CANVAS_WIDTH - 150, 25, 100);
	}
}

function drawPlayer() {
	ctx.drawImage(Player.images.standing, Player.position[0] + 8, Player.position[1] - 24);
}

function drawCrow() {
	ctx.drawImage(Crow.images.flying, Crow.position[0], Crow.position[1]);
}

function logging() {
	ctx.setFillColor('red');
	ctx.fillText("(" + Player.position[0] + ', ' + Player.position[1] + ')', 10, 20);
	ctx.fillText("Vert speed: " + Player.verticalSpeed, 10, 10);
	ctx.fillText(I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE), 10, 30);
	ctx.fillText(Map[I * Math.round(Player.position[1] / BLOCK_SIZE) + Math.round(Player.position[0] / BLOCK_SIZE)], 10, 40);
	ctx.fillText("Crow Position: (" + Crow.position[0] + ', ' + Crow.position[1] + ")", 10, 50);
}

function render(t) {
	clearColor();
	drawMap();
	drawPlayer();
	drawEnvironment();
	drawCrow();
	logging();
}

(function gameLoop(t) {
	processInput(t);
	update(t);
	render(t);

	window.requestAnimationFrame(gameLoop);
})();