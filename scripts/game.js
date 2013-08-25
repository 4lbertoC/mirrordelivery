(function () {
	/*
	 *
	 * Variable Initialization
	 *
	 */

	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

	// MIT license
	(function () {
		var lastTime = 0;
		var vendors = ['webkit', 'moz'];
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame =
				window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function (callback, element) {
				var currTime = new Date().getTime();
				var timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
						callback(currTime + timeToCall);
					},
					timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
	}());

	var canvas = document.getElementById('c'),
		ctx = canvas.getContext('2d'),
		currentT = 0,
		selectedLevel = 0,
		currentMousePosition = [0, 0],
		leftButtonDown = false,
		customLevelCounter = 1;

	// EDIT MODE VARIABLES
	var selectedBlock = 0;

	// CONSTANTS
	var CANVAS_WIDTH = 640,
		CANVAS_HEIGHT = 400,
		BLOCK_SIZE = 16,
		I = CANVAS_WIDTH / BLOCK_SIZE,
		J = CANVAS_HEIGHT / BLOCK_SIZE;

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
	// Keep this info for the level editor
	// This is number of blocks + Player + Crow + Granny + Crates position
	var NUM_BLOCKS = 8,
		GAME_ELEMENTS = {
			PLAYER: NUM_BLOCKS + 0,
			CROW: NUM_BLOCKS + 1,
			GRANNY: NUM_BLOCKS + 2,
			CRATES: NUM_BLOCKS + 3
		},
		NUM_GAME_ELEMENTS = 4,
		NUM_EDIT_OPTIONS = NUM_BLOCKS + NUM_GAME_ELEMENTS;

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

	var MAX_CRATES = 10,
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
		CROW_STUN_TIME = 5000,
		MAX_CROW_HEALTH = 10;

	var LASER_SPEED = 1,
		LASER_MOVEMENT_THRESHOLD = 3;

	var INTRO_THEME = '023123467'.split('');

	var KEYCODES = {
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		EAT: 69,
		INTERACT: 32,
		MENU: 27,
		DELETE: 68,
		JSONIZE_LEVEL: 74,
		GRANNY: 71,
		CRATES: 67,
		NAME: 78,
		TIME: 84,
		SHARE: 83
	};

	var IMAGE_MAP_DATA_NAMES = {
		CROW: 0,
		CRUMBS: 1,
		DISPENSER: 2,
		GRANNY: 3,
		LADDER: 4,
		MAN: 5,
		NEST: 6,
		ROOF: 7,
		SHOT: 8,
		WALL: 9
	}
	var IMAGE_MAP_DATA = {};

	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.CROW] = {
		frame: {
			x: 30,
			y: 0,
			w: 30,
			h: 14
		},
		spriteSourceSize: {
			x: 1,
			y: 1,
			w: 30,
			h: 14
		},
		frames: [
			{
				x: 1,
				y: 1,
				w: 15,
				h: 13
			},
			{
				x: 17,
				y: 1,
				w: 15,
				h: 13
			}
		]
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.CRUMBS] = {
		frame: {
			x: 14,
			y: 40,
			w: 14,
			h: 8
		},
		spriteSourceSize: {
			x: 1,
			y: 7,
			w: 14,
			h: 8
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.DISPENSER] = {
		frame: {
			x: 32,
			y: 14,
			w: 16,
			h: 16
		},
		spriteSourceSize: {
			x: 0,
			y: 0,
			w: 16,
			h: 16
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.GRANNY] = {
		frame: {
			x: 0,
			y: 24,
			w: 14,
			h: 24
		},
		spriteSourceSize: {
			x: 1,
			y: 7,
			w: 14,
			h: 24
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.LADDER] = {
		frame: {
			x: 16,
			y: 48,
			w: 16,
			h: 16
		},
		spriteSourceSize: {
			x: 0,
			y: 0,
			w: 16,
			h: 16
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.MAN] = {
		frame: {
			x: 0,
			y: 0,
			w: 30,
			h: 24
		},
		spriteSourceSize: {
			x: 1,
			y: 3,
			w: 30,
			h: 24
		},
		frames: [
			{
				x: 0,
				y: 0,
				w: 15,
				h: 24
			},
			{
				x: 15,
				y: 0,
				w: 15,
				h: 24
			}
		]
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.NEST] = {
		frame: {
			x: 48,
			y: 14,
			w: 16,
			h: 10
		},
		spriteSourceSize: {
			x: 0,
			y: 10,
			w: 16,
			h: 10
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.ROOF] = {
		frame: {
			x: 14,
			y: 24,
			w: 16,
			h: 16
		},
		spriteSourceSize: {
			x: 0,
			y: 0,
			w: 16,
			h: 16
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.SHOT] = {
		frame: {
			x: 30,
			y: 30,
			w: 6,
			h: 14
		},
		spriteSourceSize: {
			x: 4,
			y: 1,
			w: 6,
			h: 14
		}
	};
	IMAGE_MAP_DATA[IMAGE_MAP_DATA_NAMES.WALL] = {
		frame: {
			x: 0,
			y: 48,
			w: 16,
			h: 16
		},
		spriteSourceSize: {
			x: 0,
			y: 0,
			w: 16,
			h: 16
		}
	};

	var ImageMap = new Image(),
		FlippedImageMap = document.createElement('canvas'),
		ImageMapWidth = 0;
	ImageMap.onload = function () {
		FlippedImageMap.width = ImageMapWidth = ImageMap.naturalWidth;
		FlippedImageMap.height = ImageMap.naturalHeight;
		var imCtx = FlippedImageMap.getContext('2d');
		imCtx.translate(ImageMap.naturalWidth, 0);
		imCtx.scale(-1, 1);
		imCtx.drawImage(ImageMap, 0, 0);
	};
	ImageMap.src = 'img/imgmap.png';

	function drawImage(name, x, y, w, h) {
		var source = IMAGE_MAP_DATA[name].frame,
			destinationOffset = IMAGE_MAP_DATA[name].spriteSourceSize;
		ctx.drawImage(ImageMap, source.x, source.y, w || source.w, h || source.h, x + destinationOffset.x, y + destinationOffset.y, destinationOffset.w, destinationOffset.h);
	}

	function drawAnim(name, x, y, frameRate, isFlipped, t) {
		// if t is not specified, frameRate is the number of the frame to display
		var source = IMAGE_MAP_DATA[name].frame,
			destinationOffset = IMAGE_MAP_DATA[name].spriteSourceSize,
			frames = IMAGE_MAP_DATA[name].frames,
			/*
				time/frame = 1000/60
				frame = framerate/1000 * time
			*/
			currentFrame = t ? frames[Math.floor(t * frameRate / 1000) % frames.length] : frames[frameRate];
		if (isFlipped) {
			ctx.drawImage(FlippedImageMap, ImageMapWidth - (source.x + currentFrame.x) - currentFrame.w, source.y + currentFrame.y, currentFrame.w, currentFrame.h, x + destinationOffset.x, y + destinationOffset.y, currentFrame.w, currentFrame.h);
		} else {
			ctx.drawImage(ImageMap, source.x + currentFrame.x, source.y + currentFrame.y, currentFrame.w, currentFrame.h, x + destinationOffset.x, y + destinationOffset.y, currentFrame.w, currentFrame.h);
		}
	}

	/*
	 *
	 * The game objects
	 *
	 */

	// function initImage(src, width, height, onLoadCallback) {
	// 	var img = new Image();
	// 	img.width = width || 16;
	// 	img.height = height || 16;
	// 	img.onload = onLoadCallback;
	// 	img.src = src;
	// 	return img;
	// }

	// function initCanvas(src, width, height, isFlipped) {
	// 	var c = document.createElement('canvas'),
	// 		img = initImage(src, width, height, function () {
	// 			var imCtx = c.getContext('2d');
	// 			if (isFlipped) {
	// 				imCtx.translate(width, 0);
	// 				imCtx.scale(-1, 1);
	// 			}
	// 			imCtx.drawImage(img, 0, 0);
	// 		});
	// 	c.width = width;
	// 	c.height = height;
	// 	return c;
	// }

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
		// images: {
		// 	moving: initCanvas('img/man2.png', 32, 32),
		// 	movingFlipped: initCanvas('img/man2.png', 32, 32, true)
		// },
		wasOverSolidBlock: false,
		crateCarried: undefined,
		candies: 0,
		crates: MAX_CRATES,
		facingRight: true
	};

	var Crow = {
		position: null,
		// images: {
		// 	flying: initImage('img/crow2.png')
		// },
		shots: NEST_SHOTS,
		isInWarningZone: false,
		stunnedTimeout: 0,
		health: MAX_CROW_HEALTH
	};

	var Map = [];

	var Crate = {
		image: null,
		size: 1,
		position: null,
		startPosition: [0, 0]
	};
	var CratesArray = [];

	var Crumbs = {
		// image: initImage('img/crumbs.png'),
		position: null
	};
	var CrumbsArray = [];

	var Shot = {
		// image: initImage('img/shot.png'),
		position: null,
		speed: 6
	};
	var ShotsArray = [];

	var Game = {
		started: false,
		canvasBoundingRect: canvas.getBoundingClientRect(),
		time: 0,
		boyPoints: 0,
		crowPoints: 0,
		currentLevel: null,
		editMode: false
	};

	var InstructionCanvas = document.createElement('canvas');

	var Laser = {
		position: null
	}

	var Granny = {
		position: [80, 53],
		// image: initImage('img/granny.png'),
		startingLaserPosition: [95, 78]
	}

	/*
	 *
	 * Levels definition
	 *
	 */
	var tutorialMap = '0000000000000000000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'3300000000000000000000000000000000000060' +
		'0000000000000000000000000000000000000011' +
		'0000000000033300000000000006000000000000' +
		'1100000000033300000000000011100000000000' +
		'0000000000033300000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'3333333333333333333333333333333333333333' +
		'0000000000000000000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'0000000000000000000000000000000000000000' +
		'5555000000000000000000000000000000000000' +
		'5555000000000000000000000000000000000000' +
		'5555000000000007000000000000002000000000' +
		'1111111111111111111111111111112000000000' +
		'0000000000000000000000000000002000000000' +
		'0000000000000000000000000000002000000000' +
		'0000000000000000000000000000002000000000' +
		'0000000000000000000000000000002000000000' +
		'1111111111111111111111111111111111111111',

		lvl1Map = '0000000000000000000000000000000000000060' +
			'0000000000000000000000000000000000000011' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'0000000000000000000000000000000000000000' +
			'3333330000000000000000000000000000033333' +
			'0000000000000000000000000000000000005555' +
			'0000000000000000000000000000000000005555' +
			'0000000000700000000000000000000000005555' +
			'1111111111111111111111111111111111111111',

		lvl5Map = '3333330000000000000000000000000000000060' +
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
			'1111111111111111111111111111111111111111',
		Tutorial = {
			name: 'Tutorial',
			startingPlayerPosition: [33, 370],
			startingCrowPosition: [CANVAS_WIDTH - 24, 55],
			crateStartingPosition: [300, 365],
			grannyPosition: [20, 70],
			map: tutorialMap,
			crates: [1],
			gameTime: 3000000,
			instructions: [[20, 340, ['PLAYER 1']], [100, 340, ['ARROWS: move/jump']], [250, 340, ['SPACEBAR: grab/release crate']],
				[500, 340, ['UP/DOWN: Climb ladder']], [450, 250, ['Crates break if you fall from too high']],
				[160, 250, ['SPACE: buy candies when not holding crate', 'E: Use candy to gain speed']],
				[10, 230, ['Deliver crate to green area']], [580, 30, ['PLAYER 2']], [410, 70, ['Don\'t get shot', 'Hide in the nest']], [410, 130, ['RClick: eat from nest or candy crumbs', 'LClick: shoot!']],
				[140, 60, ['Don\'t touch roofs or the boy']]]
		},
		Level1 = {
			name: 'Level 1',
			startingPlayerPosition: [25, 366],
			startingCrowPosition: [616, 24],
			crateStartingPosition: [41, 364],
			grannyPosition: [513, 180],
			map: '00000000000000000000000000000000000000600000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000003330000000000000000000000000000000000003333300000000000000000000000000000000000055500000000000000000000000000000000000005550000020000000000000200000000000000000555020002000111111111120000333000000000111112000200133333330002000000000000000000000200021130000000000200000000000000000000020002000000000000020000000000000000000002000200020000000002111111100111001101111100111112000000000200000000000000000000000033333200000000020000000000000000000000000000020000000000000000000000000000000000000002000000000000000000000000000000000000000200000000000000000000000000000000001111111111111111111111111111111111111111',
			crates: [1, 2],
			gameTime: 60000
		},
		Level2 = {
			name: 'Level 2',
			startingPlayerPosition: [28, 143],
			startingCrowPosition: [600, 296],
			crateStartingPosition: [588, 365],
			grannyPosition: [51, 50],
			map: '33330000000000000000000000000000000000005550000000000033000000000330000000000000555000000000000000000000000000000000000055500000000000000003030000000000000000001111111000000000000030000000000000110010000000010000000000000000000000000100301000000000000200000200000200000200000000100000000011120111102000201111021113002010111100000002000000020200000002000000211100000000000100000000200000000100000020000000000000000000000000000000000002002000000000000000000000000000000000030211100000001110000000000000000000000030020000000000000000000000003333300000000002000000000000000000000000000000000003020200000000000001100000000000000000000002110000000000000000000000000020700000020200000000000000000000000000112110000002020000060000000000010000000000200000000201000011100000000000000000000020000000020000000000000000000000000000002000000002000000000000000000000000000000200000000200000000001111111111111111111111111111111111111111',
			crates: [1, 2],
			gameTime: 120000
		},
		Level5 = {
			name: 'Level 5',
			startingPlayerPosition: [75, 370],
			startingCrowPosition: [CANVAS_WIDTH - 24, 24],
			crateStartingPosition: [83, 365],
			grannyPosition: [80, 53],
			map: lvl5Map,
			crates: [1, 2, 3],
			gameTime: 300000
		},
		Levels = (window.localStorage && window.localStorage.Levels && JSON.parse(window.localStorage.Levels)) || [Tutorial, Level1, Level2, Level5];

	function createCustomLevel() {
		var currentLevel = Levels[selectedLevel];
		var CustomLevel = {
			name: 'CustomLevel' + customLevelCounter++,
			startingPlayerPosition: currentLevel.startingPlayerPosition.slice(),
			startingCrowPosition: currentLevel.startingCrowPosition.slice(),
			crateStartingPosition: currentLevel.crateStartingPosition.slice(),
			grannyPosition: currentLevel.grannyPosition && currentLevel.grannyPosition.slice(),
			map: currentLevel.map,
			crates: currentLevel.crates.slice(),
			gameTime: currentLevel.gameTime,
			isCustom: true
		}
		Levels.push(CustomLevel);
		selectedLevel = Levels.length - 1;
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
			KeyHandler.k[event['keyCode']] = currentT;
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
		if (Game.started && introThemeString.length > 0) {
			introTheme[introThemeString.shift()]['play']();
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
	loadSound(SOUND_TYPE.SUCCESS, ["synth", 0.0000, 0.4000, 0.0000, 0.1300, 0.3450, 0.4100, 253.0000, 1168.0000, 1407.0000, -0.0060, -0.0820, 0.0000, 0.0100, 0.0003, 0.0000, 0.2060, 0.1660, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000]);
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
	 * Initialization
	 *
	 */

	function printText(context, textArray, x, y, yIncrement, color, align) {
		var previousFillColor = context.fillColor;
		var previousTextAlign = context.textAlign;
		if (color) {
			context.fillStyle = color;
		}
		if (align) {
			context.textAlign = align;
		}
		var textArrayCopy = textArray.slice(),
			tempY = y;
		while (textArrayCopy.length > 0) {
			context.fillText(textArrayCopy.shift(), x, tempY);
			tempY += yIncrement;
		}
		context.fillStyle = previousFillColor;
		context.textAlign = previousTextAlign;
	}

	function resetCrates(lvl) {
		var crateStartingPosition = lvl.crateStartingPosition,
			currentCrateSize,
			newCrate,
			crateCanvas,
			crateCtx,
			x,
			y;

		Crate.startPosition = crateStartingPosition;

		CratesArray.length = 0;
		for (var cr = 0; cr < lvl.crates.length; cr++) {
			currentCrateSize = lvl.crates[cr];
			var newCrate = Object.create(Crate);
			newCrate.size = currentCrateSize;

			crateCanvas = document.createElement('canvas');
			crateCanvas.width = CRATE_WIDTH + currentCrateSize;
			crateCanvas.height = CRATE_WIDTH + currentCrateSize;
			crateCtx = crateCanvas.getContext('2d');
			crateCtx.fillStyle = 'yellow';
			crateCtx.fillRect(0, 0, CRATE_WIDTH + currentCrateSize, CRATE_WIDTH + currentCrateSize);
			crateCtx.fillStyle = 'black';
			crateCtx.fillText(currentCrateSize, 5, 10);
			newCrate.image = crateCanvas;

			x = crateStartingPosition[0] + cr * 16;
			y = crateStartingPosition[1] - currentCrateSize;
			newCrate.position = [x, y];
			newCrate.startPosition = [x, y];

			CratesArray.push(newCrate);
			currentCrateSize += CRATE_SIZE_INCREMENT;
		}
	}

	function reset(levelId) {
		var lvl = Game.currentLevel = Levels[levelId] || Levels[selectedLevel];

		Game.started = false;
		Player.position = lvl.startingPlayerPosition.slice();
		Crow.position = lvl.startingCrowPosition.slice();

		Player.candies = 0;
		Player.speedBoostTimeout = 0;
		Player.crateCarried = undefined;
		Player.crates = MAX_CRATES;
		Player.isInteracting = false;
		Player.isJumping = false;
		Player.isMoving = false;
		Player.isInAir = false;
		Player.facingLeft = false;

		Crow.health = MAX_CROW_HEALTH;
		Crow.stunnedTimeout = 0;

		Game.time = 0;
		Game.editMode = false;

		selectedBlock = 0;

		if (lvl.grannyPosition) {
			Granny.position = lvl.grannyPosition.slice();
			Granny.startingLaserPosition = [lvl.grannyPosition[0] + 15, lvl.grannyPosition[1] + 23];
			Laser.position = Granny.startingLaserPosition.slice();
		} else {
			Granny.position = null;
			Granny.startingLaserPosition = null;
		}

		Map = '4444444444444444444444444444444444444444' + lvl.map + '4444444444444444444444444444444444444444';
		Map = Map.split('');

		// Build Crates
		resetCrates(lvl);

		CrumbsArray.length = 0;
		ShotsArray.length = 0;

		InstructionCanvas.width = CANVAS_WIDTH;
		InstructionCanvas.height = CANVAS_HEIGHT;
		var icCtx = InstructionCanvas.getContext('2d');
		icCtx.fillStyle = 'rgba(0,0,0,0.7)';
		icCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		icCtx.fillStyle = '#fff';
		icCtx.font = '20px courier';
		icCtx['textAlign'] = 'center';
		icCtx.fillText(Game.currentLevel.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

		icCtx.fillText('Delivery Boy ' + Game.boyPoints + ' - ' + Game.crowPoints + ' Crow', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		icCtx.font = '15px courier';
		icCtx.fillText("Click the crow to start!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
		icCtx.fillText("< >: Select level", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
		var str = lvl.isCustom ? "E: edit   D: delete   J: insert/copy JSON   S: share" : "E: edit";
		icCtx.fillText(str, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);

		icCtx['beginPath']();
		icCtx['arc'](Crow.position[0], Crow.position[1], 16, 0, 360);
		icCtx['lineWidth'] = 1;
		icCtx['strokeStyle'] = '#fff';
		icCtx['stroke']();

		introThemeString = INTRO_THEME.slice();

		// if (window.localStorage) {
		// 	window.localStorage.Levels = JSON.stringify(Levels);
		// }
	}

	reset(selectedLevel);

	function winBoy() {
		Game.boyPoints += 1;
		canvas['style']['cursor'] = 'auto';
		playSound(SOUND_TYPE.SUCCESS);
		reset(selectedLevel);
	}

	function winCrow() {
		Game.crowPoints += 1;
		canvas['style']['cursor'] = 'auto';
		playSound(SOUND_TYPE.FAILURE);
		reset(selectedLevel);
	}

	// Helper functions

	function getCanvasRelativeCoords(evt) {
		return [evt.clientX - Game.canvasBoundingRect.left, evt.clientY - Game.canvasBoundingRect.top];
	}

	function getPlayerSpeed() {
		return Math.max(1, Player.speed + Player.speedBoost - (Player.crateCarried !== undefined ? CratesArray[Player.crateCarried].size : 0));
	}

	function addEvent(el, ev, fn) {
		if (el.addEventListener) {
			el.addEventListener(ev, fn, false);
		} else if (el.attachEvent) {
			el.attachEvent('on' + ev, fn);
		} else {
			el['on' + ev] = fn;
		}
	};

	// Add Mouse Event Listener
	addEvent(canvas, 'click', function (evt) {
		if (Game.editMode) {
			if (selectedBlock === GAME_ELEMENTS.PLAYER) {
				Player.position[0] = currentMousePosition[0];
				Player.position[1] = currentMousePosition[1];
			} else if (selectedBlock === GAME_ELEMENTS.CROW) {
				Crow.position[0] = currentMousePosition[0];
				Crow.position[1] = currentMousePosition[1];
			} else if (selectedBlock === GAME_ELEMENTS.GRANNY && Granny.position) {
				Granny.position[0] = currentMousePosition[0];
				Granny.position[1] = currentMousePosition[1];
				Granny.startingLaserPosition = [Granny.position[0] + 15, Granny.position[1] + 23];
				Laser.position = Granny.startingLaserPosition.slice();
			} else if (selectedBlock === GAME_ELEMENTS.CRATES) {
				Crate.startPosition[0] = currentMousePosition[0];
				Crate.startPosition[1] = currentMousePosition[1];
				for (var cr = 0; cr < CratesArray.length; cr++) {
					var crate = CratesArray[cr];
					crate.position[0] = currentMousePosition[0] + cr * 16;
					crate.position[1] = currentMousePosition[1] - crate.size;
				}
			}
		} else if (!Game.started) {
			if (currentMousePosition[0] > Crow.position[0] - 16 && currentMousePosition[0] < Crow.position[0] + 16 && currentMousePosition[1] > Crow.position[1] - 16 && currentMousePosition[1] < Crow.position[1] + 16) {
				Game.started = true;
				Game.time = currentT + Game.currentLevel.gameTime;
				playNextNote();

				canvas['style']['cursor'] = 'none';
			}
		} else if (Crow.shots > 0 && Crow.stunnedTimeout < currentT) {
			Crow.shots--;
			playSound(SOUND_TYPE.CROW_SHOT);
			var newShot = Object.create(Shot);
			newShot.position = Crow.position.slice();
			ShotsArray.push(newShot);
		}
	});

	addEvent(canvas, 'mousedown', function (evt) {
		if (evt.which === 1) leftButtonDown = true;
		if (Game.editMode && leftButtonDown && selectedBlock < NUM_BLOCKS) {
			setMapAt('' + selectedBlock, Math.floor(currentMousePosition[0] / BLOCK_SIZE), Math.floor(currentMousePosition[1] / BLOCK_SIZE));
		}
	});

	addEvent(canvas, 'mouseup', function (evt) {
		if (evt.which === 1) leftButtonDown = false;
	});

	addEvent(canvas, 'mousemove', function (evt) {
		var tempCurMousePos = getCanvasRelativeCoords(evt);
		currentMousePosition = [tempCurMousePos[0], tempCurMousePos[1]];
		if (Game.started) { // Update the crow's position
			var newCrowPosition = getCanvasRelativeCoords(evt);
			Crow.position = newCrowPosition.slice();
		} else if (Game.editMode && leftButtonDown) {
			if (selectedBlock < NUM_BLOCKS) {
				setMapAt('' + selectedBlock, Math.floor(currentMousePosition[0] / BLOCK_SIZE), Math.floor(currentMousePosition[1] / BLOCK_SIZE));
			}
		}
	});

	addEvent(canvas, 'contextmenu', function (evt) {
		evt.preventDefault();
		if (Game.started && Crow.stunnedTimeout < currentT) {
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

	/*
	 *
	 * Main Functions
	 *
	 */

	function getMapAt(x, y) {
		return Map[I * y + x];
	}

	function setMapAt(value, x, y) {
		if (y > 0 && y < J - 1) {
			Map[I * y + x] = value;
		}
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
				CratesArray.splice(currentCrateIdx, 1);
				if (CratesArray.length <= 0) {
					winBoy();
				} else {
					playSound(SOUND_TYPE.CRATE_DELIVERY);
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

	function validateJsonLevel(jsonLevel) {
		try {
			var level = JSON.parse(jsonLevel);
			//if(level.startingPlayerPosition)
			return true;
		} catch (e) {
			alert('Level not valid: ' + e.message);
		}
		return false;
	}

	function processInput(t) {
		var speed = getPlayerSpeed(),
			ladderSpeed = Player.ladderSpeed,
			x = Player.position[0],
			y = Player.position[1],
			k = KeyHandler.k;

		if (!Game.started && !Game.editMode) { // MENU
			if (k[KEYCODES.LEFT] && !Player.isMoving) {
				selectedLevel = (selectedLevel + Levels.length - 1) % Levels.length;
				reset(selectedLevel);
				Player.isMoving = true;
			} else if (k[KEYCODES.RIGHT] && !Player.isMoving) {
				selectedLevel = (selectedLevel + 1) % Levels.length;
				reset(selectedLevel);
				Player.isMoving = true;
			} else if (k[KEYCODES.EAT] && !Player.isMoving) {
				if (!Levels[selectedLevel].isCustom) {
					createCustomLevel();
					reset(selectedLevel);
				}
				Game.editMode = true;
			} else if (k[KEYCODES.DELETE] && !Player.isMoving) {
				Player.isMoving = true;
				if (Levels[selectedLevel].isCustom) {
					Levels.splice(selectedLevel, 1);
					selectedLevel--;
					reset(selectedLevel);
				}
			} else if (k[KEYCODES.JSONIZE_LEVEL] && Levels[selectedLevel].isCustom && !Player.isMoving) {
				var jsonLevel = prompt('LEVEL JSON', JSON.stringify(Levels[selectedLevel]));
				if (jsonLevel && validateJsonLevel(jsonLevel)) {
					Levels[selectedLevel] = JSON.parse(jsonLevel);
					reset(selectedLevel);
				}
				// Need to do this because the prompt hangs the keycode pressed
				k[KEYCODES.JSONIZE_LEVEL] = undefined;
			} else if (k[KEYCODES.SHARE] && !Player.isMoving) {
				Player.isMoving = true;

				// TODO Check if Online

				function reqListener() {
					prompt('Your level share url', this.responseText);
					k[KEYCODES.SHARE] = undefined;
				};

				var oReq = new XMLHttpRequest();
				oReq.onload = reqListener;
				oReq.open("post", "http://127.0.0.1:3000/addLevel", true);
				oReq.send(JSON.stringify(Levels[selectedLevel]));

			} else if (!k[KEYCODES.LEFT] && !k[KEYCODES.RIGHT] && !k[KEYCODES.EAT] && !k[KEYCODES.JSONIZE_LEVEL] && !k[KEYCODES.SHARE]) {
				Player.isMoving = false;
			}
			return;
		} else if (Game.editMode) {
			if (k[KEYCODES.LEFT] && !Player.isMoving) {
				selectedBlock = (selectedBlock + NUM_EDIT_OPTIONS - 1) % NUM_EDIT_OPTIONS;
				Player.isMoving = true;
			} else if (k[KEYCODES.RIGHT] && !Player.isMoving) {
				selectedBlock = (selectedBlock + 1) % NUM_EDIT_OPTIONS;
				Player.isMoving = true;
			} else if (k[KEYCODES.GRANNY] && !Player.isMoving) {
				if (Granny.position instanceof Array) {
					Granny.position = null;
					Granny.startingLaserPosition = null;
					Laser.position = null;
				} else {
					Granny.position = [32, 32];
					Granny.startingLaserPosition = [Granny.position[0] + 15, Granny.position[1] + 23];
					Laser.position = Granny.startingLaserPosition.slice();
				}
				Player.isMoving = true;
			} else if (k[KEYCODES.CRATES] && !Player.isMoving) {
				Player.isMoving = true;
				try {
					var crates = JSON.parse(prompt('Set crates', JSON.stringify(Levels[selectedLevel].crates)));
					if (crates instanceof Array) {
						for (var c = 0; c < crates.length; c++) {
							if (!typeof c === 'number') {
								alert('Crates not valid');
							}
							crates[c] = Math.max(1, Math.min(5, crates[c]));
						}
						Levels[selectedLevel].crates = crates;
						resetCrates(Levels[selectedLevel]);
					}
				} catch (e) {
					alert('Crates not valid: ' + e.message);
				}
				k[KEYCODES.CRATES] = undefined;
			} else if (k[KEYCODES.NAME] && !Player.isMoving) {
				Player.isMoving = true;
				var n = prompt('Set name', Levels[selectedLevel].name);
				if (n) {
					Levels[selectedLevel].name = n;
				}
				k[KEYCODES.NAME] = false;
			} else if (k[KEYCODES.TIME] && !Player.isMoving) {
				Player.isMoving = true;
				var t = +prompt('Set time', Levels[selectedLevel].gameTime);
				if (!isNaN(t) && t > 0) {
					Levels[selectedLevel].gameTime = t;
				}
				k[KEYCODES.TIME] = false;
			} else if (!k[KEYCODES.LEFT] && !k[KEYCODES.RIGHT] && !k[KEYCODES.GRANNY] && !k[KEYCODES.CRATES] && !k[KEYCODES.NAME] && !k[KEYCODES.TIME]) {
				Player.isMoving = false;
			}
		} else if (Game.started) {
			if (k[KEYCODES.INTERACT] && !Player.isJumping && !Player.isInAir && !Player.isInteracting) { // SPACEBAR
				Player.isInteracting = true;
				interact();
			} else if (k[KEYCODES.EAT] && !Player.isInteracting) { // E
				Player.isInteracting = true;
				if (Player.candies > 0) {
					Player.candies--;
					Player.speedBoost = SPEED_BOOST;
					Player.speedBoostTimeout = t + SPEED_BOOST_TIMEOUT;
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
				Player.facingLeft = true;
			}
			if (k[KEYCODES.RIGHT]) { // RIGHT
				Player.position[0] = Math.min(CANVAS_WIDTH - 2 * BLOCK_SIZE, x + calculateLeftRightSpeed(t));
				Player.isMoving = true;
				Player.facingLeft = false;
			}
			if (k[KEYCODES.DOWN] && (isPlayerOnBlock(BLOCK_TYPE.LADDER) || isPlayerOverBlock(BLOCK_TYPE.LADDER)) && !isPlayerOverBlock(BLOCK_TYPE.SOLID)) { // DOWN
				Player.position[1] = Math.min(CANVAS_HEIGHT, y + ladderSpeed);
				Player.isMoving = true;
			}
			if (!k[KEYCODES.LEFT] && !k[KEYCODES.UP] && !k[KEYCODES.RIGHT] && !k[KEYCODES.DOWN]) {
				Player.isMoving = false;
			}
		}
		if (k[KEYCODES.MENU]) {
			canvas['style']['cursor'] = 'auto';
			if (Game.editMode) {
				Levels[selectedLevel].map = Map.join('').substring(I, I * J - I);
				Levels[selectedLevel].startingPlayerPosition = Player.position.slice();
				Levels[selectedLevel].startingCrowPosition = Crow.position.slice();
				if (Granny.position instanceof Array) {
					Levels[selectedLevel].grannyPosition = Granny.position.slice();
				}
				Levels[selectedLevel].crateStartingPosition = Crate.startPosition.slice();
			}
			reset(selectedLevel);
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
			Player.crates--;
			if (Player.crates <= 0) {
				winCrow();
			}
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
		Crow.health--;
		if (Crow.health <= 0) {
			winBoy();
		}
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

		currentT = t;

		if (!Game.started) {
			return;
		}

		// Updating Canvas position
		Game.canvasBoundingRect = canvas.getBoundingClientRect();
		// window.onresize = function () {
		// 	Game.canvasBoundingRect = canvas.getBoundingClientRect();
		// });

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
			winCrow();
		}

		// Check if Crow is inside player's radius
		Crow.isInWarningZone = isCrowInPlayerWarningZone();

		// Update Laser's position
		if (Granny.position) {
			var laserTargetPosition = isPositionOnBlock(Crow.position, BLOCK_TYPE.NEST) ? Granny.startingLaserPosition : Crow.position,
				laserToCrowAngle = getDirectionAngle(Laser.position, laserTargetPosition),
				tangentSide = Laser.position[0] > laserTargetPosition[0] ? -1 : 1;
			if (Math.abs(laserTargetPosition[0] - Laser.position[0]) > LASER_MOVEMENT_THRESHOLD || Math.abs(laserTargetPosition[1] - Laser.position[1]) > LASER_MOVEMENT_THRESHOLD) {
				Laser.position[0] += Math.cos(laserToCrowAngle) * tangentSide * LASER_SPEED;
				Laser.position[1] += Math.sin(laserToCrowAngle) * tangentSide * LASER_SPEED;
			}
		}

		if ((isCrowInPlayerDamageZone() || isPositionOnBlock(Crow.position, BLOCK_TYPE.ROOF) || (Granny.position && (Math.sqrt(squareDistance(Laser.position, Crow.position)) < LASER_MOVEMENT_THRESHOLD))) && Crow.stunnedTimeout < t) {
			stunCrow(t);
		}
	}

	// Drawing functions

	function clearColor(color) {
		ctx.fillStyle = color || 'black';
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	function drawBlockTypeAt(blockType, x, y) {
		var image = null,
			color = '#00deff'; // As default, use sky color, also as background for images that have transparency
		if (blockType === BLOCK_TYPE.SOLID) {
			image = IMAGE_MAP_DATA_NAMES.WALL;
		} else if (blockType === BLOCK_TYPE.ROOF) {
			image = IMAGE_MAP_DATA_NAMES.ROOF;
		} else if (blockType === BLOCK_TYPE.STATUS_BAR) {
			color = '#000';
		} else if (blockType === BLOCK_TYPE.GOAL) {
			color = '#0f0';
		} else if (blockType === BLOCK_TYPE.NEST) {
			image = IMAGE_MAP_DATA_NAMES.NEST;
		} else if (blockType === BLOCK_TYPE.LADDER) {
			image = IMAGE_MAP_DATA_NAMES.LADDER;
		} else if (blockType === BLOCK_TYPE.DISPENSER) {
			image = IMAGE_MAP_DATA_NAMES.DISPENSER;
		}
		ctx.fillStyle = color;
		ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
		if (image !== null) {
			drawImage(image, x, y, BLOCK_SIZE, BLOCK_SIZE);
		}
	}

	function drawMap() {
		var i, j;
		for (i = 0; i < I; i++) {
			for (j = 0; j < J; j++) {
				drawBlockTypeAt(getMapAt(i, j), i * BLOCK_SIZE, j * BLOCK_SIZE);
			}
		}
	}

	function drawEnvironment() {
		var cur, cr;
		for (cr = 0; cr < CratesArray.length; cr++) {
			if (cr !== Player.crateCarried) {
				cur = CratesArray[cr];
				ctx.drawImage(cur.image, cur.position[0] - 8, cur.position[1] - 8);
			}
		}
		for (cr = 0; cr < CrumbsArray.length; cr++) {
			cur = CrumbsArray[cr];
			drawImage(IMAGE_MAP_DATA_NAMES.CRUMBS, cur.position[0] - 8, cur.position[1] - 8);
		}
		for (cr = 0; cr < ShotsArray.length; cr++) {
			cur = ShotsArray[cr];
			drawImage(IMAGE_MAP_DATA_NAMES.SHOT, cur.position[0] - 8, cur.position[1] - 8);
		}

		if (Granny.position) {
			drawImage(IMAGE_MAP_DATA_NAMES.GRANNY, Granny.position[0], Granny.position[1]);
		}

		if (Game.currentLevel.instructions) {
			for (var instr = 0; instr < Game.currentLevel.instructions.length; instr++) {
				printText(ctx, Game.currentLevel.instructions[instr][2], Game.currentLevel.instructions[instr][0], Game.currentLevel.instructions[instr][1], 10, 'black');
			}
		}
	}

	function drawPlayer(t) {
		if (Game.started) {
			if (Player.isInAir) {
				drawAnim(IMAGE_MAP_DATA_NAMES.MAN, Player.position[0] - 8, Player.position[1] - 24, 0, Player.facingLeft);
			} else if (Player.isMoving) {
				drawAnim(IMAGE_MAP_DATA_NAMES.MAN, Player.position[0] - 8, Player.position[1] - 24, 10, Player.facingLeft, t);
			} else {
				drawAnim(IMAGE_MAP_DATA_NAMES.MAN, Player.position[0] - 8, Player.position[1] - 24, 1, Player.facingLeft);
			}
		} else {
			drawAnim(IMAGE_MAP_DATA_NAMES.MAN, Player.position[0] - 8, Player.position[1] - 24, 1);
		}
		if (Player.crateCarried !== undefined) {
			var cur = CratesArray[Player.crateCarried];
			ctx.drawImage(cur.image, Player.facingLeft ? cur.position[0] + 2 : cur.position[0] - 16 - cur.size, cur.position[1] - 10);
		}

		if (Crow.isInWarningZone) {
			ctx['beginPath']();
			ctx['arc'](Player.position[0], Player.position[1], getDamageRadius(), 0, 360);
			ctx['lineWidth'] = 2;
			ctx['strokeStyle'] = '#f09';
			ctx['stroke']();
		}
	}

	function drawCrow(t) {
		if (Game.started) {
			if (!(Crow.stunnedTimeout > t && Math.floor(t / 100) % 2 === 0)) {
				var sx = (Math.floor(t / 100) % 6 < 3) ? 1 : 17,
					sy = 0,
					sw = 15,
					sh = 16;
				drawAnim(IMAGE_MAP_DATA_NAMES.CROW, Crow.position[0] - 8, Crow.position[1] - 8, 2, false, t);
			}
		} else {
			drawAnim(IMAGE_MAP_DATA_NAMES.CROW, Crow.position[0] - 8, Crow.position[1] - 8, 0);
		}
	}

	function drawLaser() {
		if (Granny.position) {
			ctx.fillStyle = 'red';
			ctx.fillRect(Laser.position[0] - 1, Laser.position[1] - 1, 2, 2);
			ctx['beginPath']();
			ctx['arc'](Laser.position[0], Laser.position[1], 5, 0, 360);
			ctx['lineWidth'] = 2;
			ctx['strokeStyle'] = 'red';
			ctx['stroke']();
		}
	}

	function drawStatus(t) {
		if (Game.started) {
			ctx.fillStyle = '#00deff';
			ctx.fillText("BOY", 10, 396);
			ctx.fillStyle = 'red';
			ctx.fillText("CROW", 600, 12);
			ctx.fillStyle = 'white';

			// Boy's status
			ctx.fillText("SPEED: " + getPlayerSpeed() + "   BOOST: " + Math.max(0, Math.ceil((Player.speedBoostTimeout - t) / 1000)) + "   TIME: " + Math.max(0, Math.ceil((Game.time - t) / 1000)) + "   CANDIES: " + Player.candies + "   CRATES: " + Player.crates, 50, 396);

			// Crow's status
			ctx.fillText("SHOTS: " + Crow.shots + "   STUN: " + Math.max(0, Math.ceil((Crow.stunnedTimeout - t) / 1000)) + "   HEALTH: " + Crow.health, 410, 12);
		} else if (Game.editMode) {
			ctx.fillStyle = 'white';
			ctx.fillText("< > CHANGE BLOCK   G: GRANNY   C: CRATES   T: TIME (" + Levels[selectedLevel].gameTime + ")   N: NAME (" + Levels[selectedLevel].name + ")", 12, 12);
		}
		// Logs to be removed
		// ctx.fillStyle = 'red';
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
		drawEnvironment();
		drawPlayer(t);
		drawCrow(t);
		drawLaser();
		drawStatus(t);
		if (!Game.started && !Game.editMode) {
			ctx.drawImage(InstructionCanvas, 0, 0);
		}
		if (Game.editMode) {
			ctx.globalAlpha = 0.6;
			if (selectedBlock < NUM_BLOCKS) {
				drawBlockTypeAt('' + selectedBlock, currentMousePosition[0] - (currentMousePosition[0] % BLOCK_SIZE), currentMousePosition[1] - (currentMousePosition[1] % BLOCK_SIZE))
				ctx.strokeStyle = '#000';
				ctx.strokeRect(currentMousePosition[0] - (currentMousePosition[0] % BLOCK_SIZE), currentMousePosition[1] - (currentMousePosition[1] % BLOCK_SIZE), BLOCK_SIZE, BLOCK_SIZE);
			} else if (selectedBlock === GAME_ELEMENTS.PLAYER) {
				drawAnim(IMAGE_MAP_DATA_NAMES.MAN, currentMousePosition[0] - 8, currentMousePosition[1] - 24, 1);
			} else if (selectedBlock === GAME_ELEMENTS.CROW) {
				drawAnim(IMAGE_MAP_DATA_NAMES.CROW, currentMousePosition[0] - 8, currentMousePosition[1] - 8, 0);
			} else if (selectedBlock === GAME_ELEMENTS.GRANNY) {
				drawImage(IMAGE_MAP_DATA_NAMES.GRANNY, currentMousePosition[0], currentMousePosition[1]);
			} else if (selectedBlock === GAME_ELEMENTS.CRATES) {
				ctx.fillStyle = 'yellow';
				ctx.fillRect(currentMousePosition[0] - 8, currentMousePosition[1] - 8, 16, 16);
				ctx.fillStyle = '#000';
				ctx.fillText('C', currentMousePosition[0] - 4, currentMousePosition[1] + 4);
			}
			ctx.globalAlpha = 1;
		}
	}

	(function gameLoop(t) {
		processInput(t);
		update(t);
		render(t);

		window.requestAnimationFrame(gameLoop);
	})();
})();