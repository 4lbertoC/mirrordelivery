(function () {
	/*////////////////////////////////////////
	 *
	 * Constants
	 *
	 */ ///////////////////////////////////////

	//
	// GRAPHICS
	//
	var CANVAS_WIDTH = 640,
		CANVAS_HEIGHT = 400,
		BLOCK_SIZE = 16,
		I = CANVAS_WIDTH / BLOCK_SIZE,
		J = CANVAS_HEIGHT / BLOCK_SIZE,
		IMAGE_MAP_DATA_NAMES = {
			CROW: 0,
			CRUMBS: 1,
			DISPENSER: 2,
			GRANNY: 3,
			LADDER: 4,
			MAN: 5,
			NEST: 6,
			ROOF: 7,
			SHOT: 8,
			WALL: 9,
			CAT: 10,
			CAT_MOVING: 11
		},
		IMAGE_MAP_DATA = [
			/* CROW */
			{
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
			},
			/* CRUMBS */
			{
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
			},
			/* DISPENSER */
			{
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
			},
			/* GRANNY */
			{
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
			},
			/* LADDER */
			{
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
			},
			/* MAN */
			{
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
			},
			/* NEST */
			{
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
			},
			/* ROOF */
			{
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
			},
			/* SHOT*/
			{
				frame: {
					x: 31,
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
			},
			/* WALL */
			{
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
			},
			/* CAT */
			{
				frame: {
					x: 36,
					y: 32,
					w: 11,
					h: 13
				},
				spriteSourceSize: {
					x: 0,
					y: 0,
					w: 12,
					h: 13
				}
			},
			/* CAT MOVING */
			{
				frame: {
					x: 49,
					y: 25,
					w: 15,
					h: 16
				},
				spriteSourceSize: {
					x: 0,
					y: 0,
					w: 15,
					h: 16
				}
			}
		],

		//
		// AUDIO
		//
		NOTES_CDEFGABC = [
	        523.25,
	        587.33,
	        659.26,
	        698.46,
	        783.99,
	        880.00,
	        987.77,
	        1046.50,
	        1108.73
   		],
		IS_AUDIO_SUPPORTED = window['btoa'] && window['atob'],
		INTRO_THEME = '023123467'.split(''),
		SOUND_TYPE = {
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
		},

		//
		// MAP & EDITOR
		//
		BLOCK_TYPE = {
			EMPTY: '0',
			SOLID: '1',
			LADDER: '2',
			ROOF: '3',
			STATUS_BAR: '4',
			GOAL: '5',
			NEST: '6',
			DISPENSER: '7'
		},
		// Keep this info for the level editor
		// This is number of blocks + Player + Crow + Granny + Crates position
		NUM_BLOCKS = 8,
		GAME_ELEMENTS = {
			PLAYER: NUM_BLOCKS + 0,
			CROW: NUM_BLOCKS + 1,
			GRANNY: NUM_BLOCKS + 2,
			CRATES: NUM_BLOCKS + 3
		},
		NUM_GAME_ELEMENTS = 4,
		NUM_EDIT_OPTIONS = NUM_BLOCKS + NUM_GAME_ELEMENTS,

		//
		// GAME
		//
		GAME_STATE = {
			MENU: 0,
			PLAYING: 1,
			EDIT: 2
		},

		//
		// CRATES
		//
		MAX_CRATES = 10,
		MIN_CRATE_SIZE = 1,
		CRATE_SIZE_INCREMENT = 1,
		CRATE_WIDTH = 12,
		CRATE_POSITION_OFFSET = [1, -6],
		MIN_VERTICAL_SPEED_TO_CRASH = 12,

		//
		// PLAYER
		//
		SPEED_BOOST = 3,
		SPEED_BOOST_TIMEOUT = 5000,
		PLAYER_WARNING_RADIUS = 75,
		PLAYER_DAMAGE_RADIUS = 25,
		PLAYER_RADIUS_MULTIPLIER = 7,
		DISPENSER_CANDIES = 3,

		//
		// CROW
		//
		NEST_SHOTS = 3,
		CRUMBS_SHOTS = 5,
		CROW_STUN_TIME = 5000,
		MAX_CROW_HEALTH = 10,
		CROW_SPEED = 16,

		//
		// CAT
		//
		CAT_SPAWN_THRESHOLD = 4,
		NEXT_CAT_MOVEMENT_TIMEOUT = 2000,

		//
		// GRANNY
		//
		LASER_SPEED = 1,
		LASER_MOVEMENT_THRESHOLD = 3,
		CROW_MOVEMENT_THRESHOLD = 3,

		//
		// INPUT
		//
		KEYCODES = {
			LEFT: 37,
			UP: 38,
			RIGHT: 39,
			DOWN: 40,
			EAT: 69,
			INTERACT: 32,
			MENU: 27,
			DELETE: 68,
			EXPORT_LEVEL: 74,
			GRANNY: 71,
			CRATES: 67,
			NAME: 78,
			TIME: 84,
			IMPORT_LEVEL: 73
		},

		//
		// LEVELS
		//
		LEVEL_PARAMS = {
			NAME: 0,
			PLAYER_STARTING_POSITION: 1,
			CROW_STARTING_POSITION: 2,
			CRATES_STARTING_POSITION: 3,
			GRANNY_POSITION: 4,
			TIME: 5,
			MAP: 6,
			CRATES: 7,
			INSTRUCTIONS: 8,
			IS_CUSTOM: 9
		};

	//
	// NETWORK
	//
	// SERVER_URL = 'http://mirrordelivery.herokuapp.com';



	/*////////////////////////////////////////
	 *
	 * Cross-browser helper functions
	 *
	 */ ///////////////////////////////////////

	//
	// requestAnimationFrame
	//
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	//
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	//
	// MIT license
	//
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

	//
	// CORS Request
	// http://www.nczonline.net/blog/2010/05/25/cross-domain-ajax-with-cross-origin-resource-sharing/
	//

	// function createCORSRequest(method, url) {
	// 	var xhr = new XMLHttpRequest();
	// 	if ("withCredentials" in xhr) {
	// 		xhr.open(method, url, true);
	// 	} else if (typeof XDomainRequest != "undefined") {
	// 		xhr = new XDomainRequest();
	// 		xhr.open(method, url);
	// 	} else {
	// 		xhr = null;
	// 	}
	// 	return xhr;
	// }
	// window['createCORSRequest'] = createCORSRequest;

	//
	// Event handling
	// http://javascriptrules.com/2009/07/22/cross-browser-event-listener-with-design-patterns/
	//

	function addEvent(el, ev, fn) {
		if (el.addEventListener) {
			el.addEventListener(ev, fn, false);
		} else if (el.attachEvent) {
			el.attachEvent('on' + ev, fn);
		} else {
			el['on' + ev] = fn;
		}
	}

	//
	// Detect touch device ()
	// http://stackoverflow.com/questions/3974827/detecting-touch-screen-devices-with-javascript
	// http://blog.stevelydford.com/2012/03/detecting-touch-hardware-in-ie-10/
	//
	var isMobileDevice = false;
	if (('ontouchstart' in document['documentElement']) || window['navigator']['msMaxTouchPoints']) {
		isMobileDevice = true;

		var hiddenButtons = document.getElementsByClassName('btn');
		for (var b = 0; b < hiddenButtons.length; b++) {
			if (hiddenButtons[b].getAttribute('class').indexOf('edit') === -1) {
				hiddenButtons[b].setAttribute('class', 'btn');
			}
		}
	}

	// LZW Compression/Decompression for Strings
	// http://rosettacode.org/wiki/LZW_compression#JavaScript
	// var LZW = {
	// 	compress: function (uncompressed) {
	// 		"use strict";
	// 		// Build the dictionary.
	// 		var i,
	// 			dictionary = {},
	// 			c,
	// 			wc,
	// 			w = "",
	// 			result = [],
	// 			dictSize = 256;
	// 		for (i = 0; i < 256; i += 1) {
	// 			dictionary[String.fromCharCode(i)] = i;
	// 		}

	// 		for (i = 0; i < uncompressed.length; i += 1) {
	// 			c = uncompressed.charAt(i);
	// 			wc = w + c;
	// 			//Do not use dictionary[wc] because javascript arrays 
	// 			//will return values for array['pop'], array['push'] etc
	// 			// if (dictionary[wc]) {
	// 			if (dictionary.hasOwnProperty(wc)) {
	// 				w = wc;
	// 			} else {
	// 				result.push(dictionary[w]);
	// 				// Add wc to the dictionary.
	// 				dictionary[wc] = dictSize++;
	// 				w = String(c);
	// 			}
	// 		}

	// 		// Output the code for w.
	// 		if (w !== "") {
	// 			result.push(dictionary[w]);
	// 		}
	// 		return result;
	// 	},


	// 	decompress: function (compressed) {
	// 		"use strict";
	// 		// Build the dictionary.
	// 		var i,
	// 			dictionary = [],
	// 			w,
	// 			result,
	// 			k,
	// 			entry = "",
	// 			dictSize = 256;
	// 		for (i = 0; i < 256; i += 1) {
	// 			dictionary[i] = String.fromCharCode(i);
	// 		}

	// 		w = String.fromCharCode(compressed[0]);
	// 		result = w;
	// 		for (i = 1; i < compressed.length; i += 1) {
	// 			k = compressed[i];
	// 			if (dictionary[k]) {
	// 				entry = dictionary[k];
	// 			} else {
	// 				if (k === dictSize) {
	// 					entry = w + w.charAt(0);
	// 				} else {
	// 					return null;
	// 				}
	// 			}

	// 			result += entry;

	// 			// Add w+entry[0] to the dictionary.
	// 			dictionary[dictSize++] = w + entry.charAt(0);

	// 			w = entry;
	// 		}
	// 		return result;
	// 	}
	// };



	/*////////////////////////////////////////
	 *
	 * Variables
	 *
	 */ ///////////////////////////////////////

	//
	// GRAPHICS
	//
	var canvas = document.getElementById('C'), // The main game canvas
		ctx = canvas.getContext('2d'), // The game canvas' context
		ImageMap = new Image(), // The texture atlas
		FlippedImageMap = document.createElement('canvas'), // The mirrored texture atlas, used when player is facing left
		imageMapWidth = 0,
		MenuCanvas = document.createElement('canvas'),

		//
		// GAME
		//
		currentT = 0,

		//
		// INPUT
		//
		currentMousePosition = [0, 0],
		isLeftMouseButtonDown = false,
		KeyHandler = {
			k: {},

			onKeyUp: function (event) {
				KeyHandler.k[event['keyCode']] = undefined;
			},

			onKeyDown: function (event) {
				KeyHandler.k[event['keyCode']] = currentT;
			}
		},

		//
		// AUDIO
		//
		Sounds = [],
		introTheme = {},
		introThemeString,

		//
		// EDIT MODE
		//
		selectedBlock = 0,
		toggleEditDraw = false,

		//
		// ENTITIES
		//
		Player = {
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
			crateCarried: undefined,
			candies: 0,
			crates: MAX_CRATES,
			facingLeft: false
		},

		Crow = {
			position: null,
			nextPosition: null,
			shots: 0,
			isInWarningZone: false,
			stunnedTimeout: 0,
			health: MAX_CROW_HEALTH
		},

		Cat = {
			position: null,
			nextPosition: null,
			nextCatMovement: 0
		},

		Map = [],
		solidBlockMap = null,

		Crate = {
			image: null,
			size: 1,
			position: null,
			startPosition: [0, 0]
		},
		CratesArray = [],

		Crumbs = {
			position: null
		},
		CrumbsArray = [],

		Shot = {
			position: null,
			speed: 6
		},
		ShotsArray = [],

		Granny = {
			position: null,
			startingLaserPosition: null,
			laserPosition: null
		},

		// THE CURRENT GAME THAT IS BEING PLAYED
		Game = {
			state: GAME_STATE.MENU,
			canvasBoundingRect: canvas.getBoundingClientRect(),
			time: 0,
			boyPoints: 0,
			crowPoints: 0,
			currentLevel: null
		},

		// THE PREDEFINED LEVELS
		Tutorial = [
			/* NAME */
			'Tutorial',
			/* PLAYER STARTING POSITION */
			[33, 370],
			/* CROW STARTING POSITION */
			[CANVAS_WIDTH - 24, 55],
			/* CRATES STARTING POSITION */
			[300, 365],
			/* GRANNY POSITION */
			[20, 70],
			/* TIME */
			3000000,
			/* MAP */
			'0000000000000000000000000000000000000000' +
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
			/* CRATES */
			[1],
			/* INSTRUCTIONS */
			[[20, 340, ['PLAYER 1']], [100, 340, ['ARROWS: move/jump']], [250, 340, ['SPACEBAR: grab/release crate']],
				[500, 340, ['UP/DOWN: Climb ladder']], [450, 250, ['Crates break if you fall from too high']],
				[160, 250, [(isMobileDevice ? 'S' : 'SPACEBAR') + ': buy candies when not holding crate', 'E: Use candy to gain speed']],
				[10, 230, ['Deliver crate to green area']], [560, 30, ['PLAYER 2', (isMobileDevice ? 'DPad' : 'Mouse') + ': move']], [410, 70, ['Don\'t get shot', 'Hide in the nest']], [410, 130, [(isMobileDevice ? '2' : 'RClick') + ': eat from nest or candy crumbs', (isMobileDevice ? '1' : 'LClick') + ': shoot!']],
				[140, 60, ['Don\'t touch roofs or the boy']]]],

		Level1 = [
			/* NAME */
			'Level 1',
			/* PLAYER STARTING POSITION */
			[25, 366],
			/* CROW STARTING POSITION */
			[616, 24],
			/* CRATES STARTING POSITION */
			[41, 364],
			/* GRANNY POSITION */
			[513, 180],
			/* TIME */
			60000,
			/* MAP */
			'00000000000000000000000000000000000000600000000000000000000000000000000000000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000003330000000000000000000000000000000000003333300000000000000000000000000000000000055500000000000000000000000000000000000005550000020000000000000200000000000000000555020002000111111111120000333000000000111112000200133333330002000000000000000000000200021130000000000200000000000000000000020002000000000000020000000000000000000002000200020000000002111111100111001101111100111112000000000200000000000000000000000033333200000000020000000000000000000000000000020000000000000000000000000000000000000002000000000000000000000000000000000000000200000000000000000000000000000000001111111111111111111111111111111111111111',
			/* CRATES */
			[1, 2]
		],

		Level2 = [
			/* NAME */
			'Level 2',
			/* PLAYER STARTING POSITION */
			[28, 143],
			/* CROW STARTING POSITION */
			[600, 296],
			/* CRATES STARTING POSITION */
			[588, 365],
			/* GRANNY POSITION */
			[51, 50],
			/* TIME */
			120000,
			/* MAP */
			'33330000000000000000000000000000000000005550000000000033000000000330000000000000555000000000000000000000000000000000000055500000000000000003030000000000000000001111111000000000000030000000000000110010000000010000000000000000000000000100301000000000000200000200000200000200000000100000000011120111102000201111021113002010111100000002000000020200000002000000211100000000000100000000200000000100000020000000000000000000000000000000000002002000000000000000000000000000000000030211100000001110000000000000000000000030020000000000000000000000003333300000000002000000000000000000000000000000000003020200000000000001100000000000000000000002110000000000000000000000000020700000020200000000000000000000000000112110000002020000060000000000010000000000200000000201000011100000000000000000000020000000020000000000000000000000000000002000000002000000000000000000000000000000200000000200000000001111111111111111111111111111111111111111',
			/* CRATES */
			[1, 2]
		],

		Level3 = [
			/* NAME */
			'Level 3',
			/* PLAYER STARTING POSITION */
			[17, 349],
			/* CROW STARTING POSITION */
			[281, 39],
			/* CRATES STARTING POSITION */
			[96, 316],
			/* GRANNY POSITION */
			[49, 163],
			/* TIME */
			240000,
			/* MAP */
			"00000000000000010001000000000000000000000000000000300001666100003000000000000020000000000003000111110003000000000007002000000000000030000000003000000000001110203000000000000000000000000000000000000020332200000000000000000000000000000000002033202000000000000000000000000000000000203320320000000000222000000000000000000020332033111001111100011111000110011001102055200000000000000000000000000110011000205520000000000000000000000000000000000020111100000000000000000000000000000000002000000000000000030003000000000220022000200000000000000030000030000200000000000020000000000000000300030000020000000000002000003030300000000200000002011001100110200003030303030303020000000200011001100020000000000030303032111111000000000000000000000000000000000203030303030000000000000000011100070000023030303030300000000000000000000011100002000000000000000000000011110000000000000200000000000000000000001111111111111111111111111111111111111111",
			/* CRATES */
			[1, 2]
		],

		Level4 = [
			/* NAME */
			'Level 4',
			/* PLAYER STARTING POSITION */
			[75, 370],
			/* CROW STARTING POSITION */
			[CANVAS_WIDTH - 24, 24],
			/* CRATES STARTING POSITION */
			[83, 365],
			/* GRANNY POSITION */
			[80, 53],
			/* TIME */
			300000,
			/* MAP */
			'3333330000000000000000000000000000000060' +
			'5555530000000000000000000000000000000011' +
			'5555500000000000000000000033330000000000' +
			'5555500000000000000200000000000000000000' +
			'1111110010011001111201110011110000000000' +
			'0000000000033000000200000000001000000000' +
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
			'0020000000000000000020000003030302000000' +
			'0020000000000000000020700000000002000000' +
			'0000333330003030300011110000200002000000' +
			'0000000000000000000000000000211112000000' +
			'0000000000000000000000000000200000000000' +
			'1111111111111111111111111111111111111111',
			/* CRATES */
			[1, 2, 3]
		],

		baseLevels = [Tutorial, Level1, Level2, Level3, Level4],
		Levels = (window.localStorage && window.localStorage.Levels && JSON.parse(window.localStorage.Levels)) || baseLevels,
		customLevelCounter = Levels.length - baseLevels.length + 1,
		selectedLevel = 0;



	/*////////////////////////////////////////
	 *
	 * Game functions
	 *
	 */ ///////////////////////////////////////

	//
	// GRAPHICS
	//

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
			ctx.drawImage(FlippedImageMap, imageMapWidth - (source.x + currentFrame.x) - currentFrame.w, source.y + currentFrame.y, currentFrame.w, currentFrame.h, x + destinationOffset.x, y + destinationOffset.y, currentFrame.w, currentFrame.h);
		} else {
			ctx.drawImage(ImageMap, source.x + currentFrame.x, source.y + currentFrame.y, currentFrame.w, currentFrame.h, x + destinationOffset.x, y + destinationOffset.y, currentFrame.w, currentFrame.h);
		}
	}

	function drawImage(name, x, y, w, h) {
		var source = IMAGE_MAP_DATA[name].frame,
			destinationOffset = IMAGE_MAP_DATA[name].spriteSourceSize;
		ctx.drawImage(ImageMap, source.x, source.y, w || source.w, h || source.h, x + destinationOffset.x, y + destinationOffset.y, destinationOffset.w, destinationOffset.h);
	}

	function getCanvasRelativeCoords(evt) {
		var x = evt.clientX - Game.canvasBoundingRect.left,
			y = evt.clientY - Game.canvasBoundingRect.top;
		x = Math.max(0, Math.min(x, CANVAS_WIDTH - 1));
		y = Math.max(0, Math.min(y, CANVAS_HEIGHT - 1));
		return [x, y];
	}

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

	//
	// AUDIO
	//

	function loadSound(name, data) {
		if (!IS_AUDIO_SUPPORTED) {
			return;
		}
		try {
			Sounds[name] = jsfxlib.createWave(data);
		} catch (e) {}
	}

	function playNextNote() {
		if (!IS_AUDIO_SUPPORTED) {
			return;
		}
		try {
			if (Game.state === GAME_STATE.PLAYING && introThemeString.length > 0) {
				introTheme[introThemeString.shift()]['play']();
				setTimeout(playNextNote, 200);
			}
		} catch (e) {}
	}

	function playSound(soundName) {
		if (!IS_AUDIO_SUPPORTED) {
			return;
		}
		try {
			if (Sounds[soundName]) {
				Sounds[soundName]['pause']();
				Sounds[soundName]['currentTime'] = 0;
				Sounds[soundName]['play']();
			}
		} catch (e) {}
	}

	//
	// LEVELS
	//

	function createCustomLevel(level) {
		var currentLevel = level || Levels[selectedLevel];
		var CustomLevel = [
			/* NAME */
			'CustomLevel' + customLevelCounter++,
			/* PLAYER STARTING POSITION */
			currentLevel[LEVEL_PARAMS.PLAYER_STARTING_POSITION].slice(),
			/* CROW STARTING POSITION */
			currentLevel[LEVEL_PARAMS.CROW_STARTING_POSITION].slice(),
			/* CRATES STARTING POSITION */
			currentLevel[LEVEL_PARAMS.CRATES_STARTING_POSITION].slice(),
			/* GRANNY POSITION */
			currentLevel[LEVEL_PARAMS.GRANNY_POSITION] && currentLevel[LEVEL_PARAMS.GRANNY_POSITION].slice(),
			/* TIME */
			currentLevel[LEVEL_PARAMS.TIME],
			/* MAP */
			currentLevel[LEVEL_PARAMS.MAP],
			/* CRATES */
			currentLevel[LEVEL_PARAMS.CRATES].slice(),
			/* INSTRUCTIONS */
			null,
			/* IS_CUSTOM */
			true
		];
		Levels.push(CustomLevel);
		if (Game.state === GAME_STATE.MENU) {
			selectedLevel = Levels.length - 1;
			resetGame(selectedLevel);
		}
	}

	//
	// GAME
	//

	function getPlayerSpeed() {
		return Math.max(1, Player.speed + Player.speedBoost - (Player.crateCarried !== undefined ? CratesArray[Player.crateCarried].size : 0));
	}

	function resetCrates(lvl) {
		var crateStartingPosition = lvl[LEVEL_PARAMS.CRATES_STARTING_POSITION],
			currentCrateSize,
			newCrate,
			crateCanvas,
			crateCtx,
			x,
			y;

		Crate.startPosition = crateStartingPosition;

		CratesArray.length = 0;
		for (var cr = 0; cr < lvl[LEVEL_PARAMS.CRATES].length; cr++) {
			currentCrateSize = lvl[LEVEL_PARAMS.CRATES][cr];
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

	function resetGame(levelId) {
		var lvl = Game.currentLevel = Levels[levelId] || Levels[selectedLevel];

		setGameState(GAME_STATE.MENU);
		Player.position = lvl[LEVEL_PARAMS.PLAYER_STARTING_POSITION].slice();
		Crow.position = lvl[LEVEL_PARAMS.CROW_STARTING_POSITION].slice();

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
		Crow.shots = 0;
		Crow.stunnedTimeout = 0;

		Cat.position = Cat.nextPosition = null;

		Game.time = 0;
		setGameState(GAME_STATE.MENU);

		selectedBlock = 0;

		if (lvl[LEVEL_PARAMS.GRANNY_POSITION]) {
			Granny.position = lvl[LEVEL_PARAMS.GRANNY_POSITION].slice();
			Granny.startingLaserPosition = [lvl[LEVEL_PARAMS.GRANNY_POSITION][0] + 15, lvl[LEVEL_PARAMS.GRANNY_POSITION][1] + 23];
			Granny.laserPosition = Granny.startingLaserPosition.slice();
		} else {
			Granny.position = null;
			Granny.startingLaserPosition = null;
		}

		Map = '4444444444444444444444444444444444444444' + lvl[LEVEL_PARAMS.MAP] + '4444444444444444444444444444444444444444';
		Map = Map.split('');
		solidBlockMap = null;

		// Build Crates
		resetCrates(lvl);

		CrumbsArray.length = 0;
		ShotsArray.length = 0;

		MenuCanvas.width = CANVAS_WIDTH;
		MenuCanvas.height = CANVAS_HEIGHT;
		var icCtx = MenuCanvas.getContext('2d');
		icCtx.fillStyle = 'rgba(0,0,0,0.7)';
		icCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		icCtx.fillStyle = '#fff';
		icCtx.font = '20px courier';
		icCtx['textAlign'] = 'center';
		icCtx.fillText(Game.currentLevel[LEVEL_PARAMS.NAME], CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

		icCtx.fillText('Delivery Boy ' + Game.boyPoints + ' - ' + Game.crowPoints + ' Crow', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
		icCtx.font = '15px courier';
		icCtx.fillText("Click the " + (isMobileDevice ? "screen" : "crow") + " to start!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
		icCtx.fillText("< >: Select level", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 100);
		var str = lvl[LEVEL_PARAMS.IS_CUSTOM] ? "E: EDIT   " + (isMobileDevice ? "1" : "D") + ": DELETE   " + (isMobileDevice ? "2" : "J") + ": EXPORT   I: IMPORT" : "E: EDIT   I: IMPORT";
		icCtx.fillText(str, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 120);

		icCtx['beginPath']();
		icCtx['arc'](Crow.position[0], Crow.position[1], 16, 0, 360);
		icCtx['lineWidth'] = 1;
		icCtx['strokeStyle'] = '#fff';
		icCtx['stroke']();

		introThemeString = INTRO_THEME.slice();

		if (window.localStorage) {
			window.localStorage.Levels = JSON.stringify(Levels);
		}
	}

	function startGame() {
		setGameState(GAME_STATE.PLAYING);
		Game.time = currentT + Game.currentLevel[LEVEL_PARAMS.TIME];
		playNextNote();

		canvas['style']['cursor'] = 'none';
	}

	function winBoy() {
		Game.boyPoints += 1;
		canvas['style']['cursor'] = 'auto';
		playSound(SOUND_TYPE.SUCCESS);
		resetGame(selectedLevel);
	}

	function winCrow() {
		Game.crowPoints += 1;
		canvas['style']['cursor'] = 'auto';
		playSound(SOUND_TYPE.FAILURE);
		resetGame(selectedLevel);
	}

	function setGameState(state) {
		Game.state = state;
		if (isMobileDevice) {
			var editButtons = document['getElementsByClassName']('edit'),
				className = 'btn edit' + (state === GAME_STATE.EDIT ? '' : ' h');
			for (var eb = 0; eb < editButtons.length; eb++) {
				editButtons[eb].setAttribute('class', className);
			}
		}
	}

	function exitFromEditModeAndSave() {
		canvas['style']['cursor'] = 'auto';
		if (Game.state === GAME_STATE.EDIT) {
			Levels[selectedLevel][LEVEL_PARAMS.MAP] = Map.join('').substring(I, I * J - I);
			Levels[selectedLevel][LEVEL_PARAMS.PLAYER_STARTING_POSITION] = Player.position.slice();
			Levels[selectedLevel][LEVEL_PARAMS.CROW_STARTING_POSITION] = Crow.position.slice();
			Levels[selectedLevel][LEVEL_PARAMS.GRANNY_POSITION] = Granny.position ? Granny.position.slice() : undefined;
			Levels[selectedLevel][LEVEL_PARAMS.CRATES_STARTING_POSITION] = Crate.startPosition.slice();
		}
		resetGame(selectedLevel);
	}

	//
	// CROW ACTIONS
	//

	function crowEat(evt) {
		evt.preventDefault();
		if (Game.state === GAME_STATE.EDIT) {
			toggleEditDraw = !toggleEditDraw;
		} else if (Game.state === GAME_STATE.PLAYING && Crow.stunnedTimeout < currentT) {
			var currentMousePosition = getCanvasRelativeCoords(evt);
			if (isCrowOnBlock(BLOCK_TYPE.NEST) && Crow.shots < NEST_SHOTS) {
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
	}

	function crowShoot(evt) {
		if (Game.state === GAME_STATE.EDIT) {
			if (selectedBlock < NUM_BLOCKS) {
				setMapAtXY('' + selectedBlock, currentMousePosition[0], currentMousePosition[1]);
			} else if (selectedBlock === GAME_ELEMENTS.PLAYER) {
				Player.position = currentMousePosition.slice();
			} else if (selectedBlock === GAME_ELEMENTS.CROW) {
				Crow.position = currentMousePosition.slice();
			} else if (selectedBlock === GAME_ELEMENTS.GRANNY && Granny.position) {
				Granny.position = currentMousePosition.slice();
				Granny.startingLaserPosition = [Granny.position[0] + 15, Granny.position[1] + 23];
				Granny.laserPosition = Granny.startingLaserPosition.slice();
			} else if (selectedBlock === GAME_ELEMENTS.CRATES) {
				Crate.startPosition = currentMousePosition.slice();
				for (var cr = 0; cr < CratesArray.length; cr++) {
					var crate = CratesArray[cr];
					crate.position[0] = currentMousePosition[0] + cr * 16;
					crate.position[1] = currentMousePosition[1] - crate.size;
				}
			}
		} else if (Game.state === GAME_STATE.MENU && !isMobileDevice) {
			if (currentMousePosition[0] > Crow.position[0] - 16 && currentMousePosition[0] < Crow.position[0] + 16 && currentMousePosition[1] > Crow.position[1] - 16 && currentMousePosition[1] < Crow.position[1] + 16) {
				startGame();
			}
		} else if (Crow.shots > 0 && Crow.stunnedTimeout < currentT) {
			Crow.shots--;
			playSound(SOUND_TYPE.CROW_SHOT);
			var newShot = Object.create(Shot);
			newShot.position = Crow.position.slice();
			ShotsArray.push(newShot);
		}
	}

	function getWarningRadius() {
		return getPlayerSpeed() * PLAYER_RADIUS_MULTIPLIER + PLAYER_WARNING_RADIUS;
	}

	function getDamageRadius() {
		return getPlayerSpeed() * PLAYER_RADIUS_MULTIPLIER + PLAYER_DAMAGE_RADIUS;
	}

	function isCrowInPlayerWarningZone() {
		return getWarningRadius(), 2 >= distance(Crow.position, Player.position);
	}

	function isCrowInPlayerDamageZone() {
		return getDamageRadius(), 2 >= distance(Crow.position, Player.position);
	}

	function stunCrow(t) {
		Crow.stunnedTimeout = t + CROW_STUN_TIME;
		playSound(SOUND_TYPE.GRANNY_SHOT);
		Crow.shots = 0;
		Crow.health--;
		if (Crow.health <= 0) {
			winBoy();
		} else if (Crow.health < CAT_SPAWN_THRESHOLD) {
			showCat(t);
		}
	}

	//
	// PLAYER ACTIONS
	//

	function breakCurrentCrate(currentCrate, t) {
		playSound(SOUND_TYPE.PLAYER_CRASH);
		Player.crateCarried = undefined;
		currentCrate.position = currentCrate.startPosition.slice();
		Player.crates--;
		if (Player.crates <= 0) {
			winCrow();
		} else if (Player.crates < CAT_SPAWN_THRESHOLD) {
			showCat(t);
		}
	}

	function calculateLeftRightSpeed(t) {
		var currentSpeed = Player.currentSpeed,
			speed = getPlayerSpeed();
		if (!Player.isMoving) {
			currentSpeed = 0;
		}
		currentSpeed = Math.min(speed, currentSpeed + speed / 7);
		Player.currentSpeed = currentSpeed;
		return (isPlayerOnBlock(BLOCK_TYPE.LADDER) ? speed / 2 : currentSpeed);
	}

	function checkIfCurrentCrateBreaks(t) {
		var currentCrate = getCurrentCrate();
		if (currentCrate) {
			var verticalSpeedThreshold = MIN_VERTICAL_SPEED_TO_CRASH - currentCrate.size;
			if (Player.verticalSpeed > verticalSpeedThreshold && currentCrate) {
				breakCrate(currentCrate, t);
			}
		}
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

	function getCurrentCrate() {
		return Player.crateCarried !== undefined ? CratesArray[Player.crateCarried] : undefined;
	}

	//
	// CAT
	//

	function getCatNextPosition() {
		if (!solidBlockMap) {
			solidBlockMap = [];
			for (var i = 0; i < Map.length; i++) {
				if (Map[i] === BLOCK_TYPE.SOLID) {
					solidBlockMap.push(i);
				}
			}
		}
		var rndPos = solidBlockMap[Math.floor(Math.random() * solidBlockMap.length)],
			x = rndPos % I,
			y = Math.floor(rndPos / I);

		return [x * BLOCK_SIZE, y * BLOCK_SIZE];
	}

	function showCat(t) {
		var nextPosition = getCatNextPosition();
		Cat.nextPosition = [nextPosition[0] - 6, nextPosition[1] - 10];
		if (!Cat.position) {
			Cat.position = Cat.nextPosition.slice();
		}
		Cat.nextCatMovement = t + NEXT_CAT_MOVEMENT_TIMEOUT;
	}

	//
	// MAP
	//

	function arePositionsInSameBlock(pos1, pos2) {
		return (Math.round(pos1[0] / BLOCK_SIZE) === Math.round(pos2[0] / BLOCK_SIZE)) && (Math.round(pos1[1] / BLOCK_SIZE) === Math.round(pos2[1] / BLOCK_SIZE));
	}

	function distance(pos1, pos2) {
		return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2));
	}

	function getDirectionAngle(origin, destination) {
		return Math.atan((destination[1] - origin[1]) / (destination[0] - origin[0]));
	}

	function getMapAt(i, j) {
		return Map[I * j + i];
	}

	function getMapAtXY(x, y) {
		return Map[I * Math.floor(y / BLOCK_SIZE) + Math.floor(x / BLOCK_SIZE)];
	}

	function isAABBCollidingWithBlock(x1, y1, w1, h1, blockType) {
		var x = x1,
			y = y1,
			topLeft = getMapAtXY(x, y);
		x = x1 + w1;
		topRight = getMapAtXY(x, y);
		y = y1 + h1;
		bottomRight = getMapAtXY(x, y);
		x = x1, y = y1,
		bottomLeft = getMapAtXY(x, y);

		return (topLeft === blockType) || (topRight === blockType) || (bottomRight === blockType) || (bottomLeft === blockType);
	}

	function isAABBOverBlock(x1, y1, w1, h1, blockType) {
		var x = x1,
			y = y1 + h1,
			bottomRight = getMapAtXY(x, y);
		x = x1 + w1,
		bottomLeft = getMapAtXY(x, y);

		return (bottomRight === blockType) || (bottomLeft === blockType);
	}

	function isCrowOnBlock(blockType) {
		return isAABBOverBlock(Crow.position[0] - 8, Crow.position[1] - 8, 16, 16, blockType) ||
			isAABBCollidingWithBlock(Crow.position[0], Crow.position[1], 0, 0, blockType);
	}

	function isPlayerOnBlock(blockType) {
		return isAABBCollidingWithBlock(Player.position[0] - 8, Player.position[1] - 32, 16, 32, blockType) ||
			isAABBCollidingWithBlock(Player.position[0], Player.position[1] - 8, 0, 0, blockType);
	}

	function isPositionOnBlock(position, blockType) {
		return isAABBOverBlock(position[0], position[1], 0, 0, blockType);
	}

	function setMapAtXY(value, x, y) {
		var idx = (I * Math.floor(y / BLOCK_SIZE) + Math.floor(x / BLOCK_SIZE));
		if (idx < Map.length) {
			Map[idx] = value;
		}
	}

	//
	// INPUT
	//

	function bindButtonToKeyCode(buttonId, keyCode) {
		var btn = document.getElementById(buttonId);

		function touchstart() {
			KeyHandler.onKeyDown({
				'keyCode': keyCode
			});
		}

		function touchend() {
			KeyHandler.onKeyUp({
				'keyCode': keyCode
			});
		}
		addEvent(btn, 'touchstart', touchstart);
		addEvent(btn, 'touchend', touchend);
		addEvent(btn, 'MSPointerDown', touchstart);
		addEvent(btn, 'MSPointerUp', touchend);
	}

	function bindButtonToCustomFunction(buttonId, touchStartCallback, touchEndCallback) {
		var btn = document.getElementById(buttonId);
		addEvent(btn, 'touchstart', touchStartCallback);
		addEvent(btn, 'touchend', touchEndCallback);
		addEvent(btn, 'MSPointerDown', touchStartCallback);
		addEvent(btn, 'MSPointerUp', touchEndCallback);
	}



	/*////////////////////////////////////////
	 *
	 * Game loop specific functions
	 *
	 */ ///////////////////////////////////////

	// var inputHandlers = [];
	// for (var gs = 0; gs < GAME_STATE.length; gs++) {
	// 	inputHandlers[gs] = {};
	// }

	// function assignInput(gameState, keyCode, callback) {
	// 	inputHandlers[gameState][keyCode] = callback;
	// }
	// var state = GAME_STATE.MENU;
	// assignInput(state, KEYCODES.LEFT, function () {
	// 	selectedLevel = (selectedLevel + Levels.length - 1) % Levels.length;
	// 	resetGame(selectedLevel);
	// });

	//
	// INPUT
	//

	function processInput(t) {
		// var k = KeyHandler.k;
		// if (!Player.isMoving) {
		// 	for (var key in k) {
		// 		if (k[key] && inputHandlers[k[key]]) {
		// 			inputHandlers[k[key]]();
		// 			Player.isMoving 
		// 		}
		// 	}
		// }

		var speed = getPlayerSpeed(),
			ladderSpeed = Player.ladderSpeed,
			x = Player.position[0],
			y = Player.position[1],
			k = KeyHandler.k;

		if (Game.state === GAME_STATE.MENU) { // MENU
			if (k[KEYCODES.LEFT] && !Player.isMoving) {
				selectedLevel = (selectedLevel + Levels.length - 1) % Levels.length;
				resetGame(selectedLevel);
				Player.isMoving = true;
			} else if (k[KEYCODES.RIGHT] && !Player.isMoving) {
				selectedLevel = (selectedLevel + 1) % Levels.length;
				resetGame(selectedLevel);
				Player.isMoving = true;
			} else if (k[KEYCODES.EAT] && !Player.isMoving) {
				Player.isMoving = true;
				if (!Levels[selectedLevel][LEVEL_PARAMS.IS_CUSTOM]) {
					createCustomLevel();
				}
				setGameState(GAME_STATE.EDIT);
				k[KEYCODES.EAT] = undefined;
			} else if (k[KEYCODES.DELETE] && !Player.isMoving) {
				Player.isMoving = true;
				if (Levels[selectedLevel][LEVEL_PARAMS.IS_CUSTOM]) {
					Levels.splice(selectedLevel, 1);
					selectedLevel--;
					resetGame(selectedLevel);
				}
				k[KEYCODES.DELETE] = undefined;
			} else if (k[KEYCODES.EXPORT_LEVEL] && Levels[selectedLevel][LEVEL_PARAMS.IS_CUSTOM] && !Player.isMoving) {
				// var compressedLevel = LZW.compress(JSON.stringify(Levels[selectedLevel]));
				// var compressedString = '',
				// 	ch = 0;
				// for (ch = 0; ch < compressedLevel.length; ch++) {
				// 	compressedString += String.fromCharCode(compressedLevel[ch]);
				// }
				// var jsonLevel = prompt('Level data', compressedString);
				var jsonLevel = prompt('Level data', JSON.stringify(Levels[selectedLevel]));
				// Need to do this because the prompt hangs the keycode pressed
				k[KEYCODES.EXPORT_LEVEL] = undefined;
			} else if (k[KEYCODES.IMPORT_LEVEL]) {
				var jsonLevel = prompt('Level data');
				if (jsonLevel) {
					try {
						// var arrayOfChars = [];
						// for (ch = 0; ch < jsonLevel.length; ch++) {
						// 	arrayOfChars.push(jsonLevel.charCodeAt(ch));
						// }
						// createCustomLevel(JSON.parse(LZW.decompress(arrayOfChars)));
						createCustomLevel(JSON.parse(jsonLevel));
					} catch (e) {
						alert('Error!');
					}
				}
				// Need to do this because the prompt hangs the keycode pressed
				k[KEYCODES.IMPORT_LEVEL] = undefined;
			} else if (!k[KEYCODES.LEFT] && !k[KEYCODES.RIGHT] && !k[KEYCODES.DELETE] && !k[KEYCODES.EAT] && !k[KEYCODES.EXPORT_LEVEL] && !k[KEYCODES.IMPORT_LEVEL] /*&& !k[KEYCODES.SHARE]*/ ) {
				Player.isMoving = false;
			}
			return;
		} else if (Game.state === GAME_STATE.EDIT) {
			if (k[KEYCODES.LEFT] && !Player.isMoving) {
				selectedBlock = (selectedBlock + NUM_EDIT_OPTIONS - 1) % NUM_EDIT_OPTIONS;
				Player.isMoving = true;
			} else if (k[KEYCODES.RIGHT] && !Player.isMoving) {
				selectedBlock = (selectedBlock + 1) % NUM_EDIT_OPTIONS;
				Player.isMoving = true;
			} else if (k[KEYCODES.GRANNY] && !Player.isMoving) {
				if (Granny.position instanceof Array) {
					Granny.position = Granny.startingLaserPosition = Granny.laserPosition = null;
				} else {
					Granny.position = [32, 32];
					Granny.startingLaserPosition = [Granny.position[0] + 15, Granny.position[1] + 23];
					Granny.laserPosition = Granny.startingLaserPosition.slice();
				}
				Player.isMoving = true;
			} else if (k[KEYCODES.CRATES] && !Player.isMoving) {
				Player.isMoving = true;
				try {
					var crates = JSON.parse(prompt('Crates', JSON.stringify(Levels[selectedLevel][LEVEL_PARAMS.CRATES])));
					if (crates instanceof Array) {
						for (var c = 0; c < crates.length; c++) {
							if (!typeof c === 'number') {
								alert('Error!');
							}
							crates[c] = Math.max(1, Math.min(5, crates[c]));
						}
						Levels[selectedLevel][LEVEL_PARAMS.CRATES] = crates;
						resetCrates(Levels[selectedLevel]);
					}
				} catch (e) {
					alert('Error!');
				}
				k[KEYCODES.CRATES] = undefined;
			} else if (k[KEYCODES.NAME] && !Player.isMoving) {
				Player.isMoving = true;
				var n = prompt('Name', Levels[selectedLevel][LEVEL_PARAMS.NAME]);
				if (n) {
					Levels[selectedLevel][LEVEL_PARAMS.NAME] = n;
				}
				k[KEYCODES.NAME] = false;
			} else if (k[KEYCODES.TIME] && !Player.isMoving) {
				Player.isMoving = true;
				var t = +prompt('Time', Levels[selectedLevel][LEVEL_PARAMS.TIME]);
				if (!isNaN(t) && t > 0) {
					Levels[selectedLevel][LEVEL_PARAMS.TIME] = t;
				}
				k[KEYCODES.TIME] = false;
			} else if (k[KEYCODES.EAT] && !Player.isMoving) {
				Player.isMoving = true;
				exitFromEditModeAndSave();
				k[KEYCODES.EAT] = undefined;
			} else if (!k[KEYCODES.LEFT] && !k[KEYCODES.RIGHT] && !k[KEYCODES.GRANNY] && !k[KEYCODES.CRATES] && !k[KEYCODES.NAME] && !k[KEYCODES.TIME] && !k[KEYCODES.EAT]) {
				Player.isMoving = false;
			}
		} else if (Game.state === GAME_STATE.PLAYING) {
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
			if (k[KEYCODES.DOWN] && isPlayerOnBlock(BLOCK_TYPE.LADDER)) { // DOWN
				Player.position[1] = Math.min(CANVAS_HEIGHT, y + ladderSpeed);
				Player.isMoving = true;
			}
			if (!k[KEYCODES.LEFT] && !k[KEYCODES.UP] && !k[KEYCODES.RIGHT] && !k[KEYCODES.DOWN]) {
				Player.isMoving = false;
			}
		}
		if (k[KEYCODES.MENU]) {
			exitFromEditModeAndSave();
		}
	}

	//
	// GAME
	//

	function updateMovingPosition(entity, threshold) {
		if (entity.position && entity.nextPosition) {
			var crowAngle = getDirectionAngle(entity.position, entity.nextPosition),
				crowTangentSize = entity.position[0] > entity.nextPosition[0] ? -1 : 1,
				absDX = Math.abs(entity.position[0] - entity.nextPosition[0]),
				absDY = Math.abs(entity.position[1] - entity.nextPosition[1]);
			if (absDX > threshold || absDY > threshold) {
				var dx = Math.cos(crowAngle) * crowTangentSize * CROW_SPEED,
					dy = Math.sin(crowAngle) * crowTangentSize * CROW_SPEED;
				if (Math.abs(dx) > absDX) {
					dx = absDX * dx / Math.abs(dx);
				}
				if (Math.abs(dy) > absDY) {
					dy = absDY * dy / Math.abs(dy);
				}
				entity.position[0] += dx;
				entity.position[1] += dy;
			}
		}
	}

	function update(t) {

		currentT = t;

		// Mobile controls
		if (isTouchingDPad && touchPositions) {
			var touchPosition, tempTp;
			if (touchPositions['clientX']) {
				touchPosition = touchPositions
			} else if (touchPositions instanceof Array) {
				for (var tp = 0; tp < touchPositions.length; tp++) {
					tempTp = touchPositions[tp];
					if (tempTp.clientX >= dPadDivPosition.left && tempTp.clientX < (dPadDivPosition.left + dPadDivPosition.width) &&
						tempTp.clientY >= dPadDivPosition.top && tempTp.clientY < (dPadDivPosition.top + dPadDivPosition.height)) {
						touchPosition = touchPositions[tp];
						break;
					}
				}
			}
			if (touchPosition) {
				var dPadClickPosition = [touchPosition.clientX - dPadDivPosition.left, touchPosition.clientY - dPadDivPosition.top],
					angle = getDirectionAngle(dPadCenter, dPadClickPosition),
					module = distance(dPadCenter, dPadClickPosition) / 12.5;
				var pos;
				if (Game.state === GAME_STATE.PLAYING) {
					pos = Crow.position;
				} else if (Game.state === GAME_STATE.EDIT) {
					pos = currentMousePosition;
				}
				if (pos) {
					pos[0] += (Game.state === GAME_STATE.EDIT ? Math.round(Math.cos(angle)) : Math.cos(angle)) * (dPadClickPosition[0] < 100 ? -module : module);
					pos[1] += (Game.state === GAME_STATE.EDIT ? Math.round(Math.sin(angle)) : Math.sin(angle)) * (dPadClickPosition[0] < 100 ? -module : module);
					pos[0] = Math.max(0, Math.min(pos[0], CANVAS_WIDTH - 1));
					pos[1] = Math.max(0, Math.min(pos[1], CANVAS_HEIGHT - 1));
				}
				if (toggleEditDraw) {
					crowShoot();
				}
			}
		}

		if (Game.state !== GAME_STATE.PLAYING) {
			return;
		}

		// Updating Canvas position
		Game.canvasBoundingRect = canvas.getBoundingClientRect();
		// window.onresize = function () {
		// 	Game.canvasBoundingRect = canvas.getBoundingClientRect();
		// });

		// Player collision
		var currentVectorFraction = 0,
			stoppingY;
		while (currentVectorFraction <= Player.verticalSpeed) {
			if (isAABBOverBlock(Player.position[0] - 8, Player.position[1] + currentVectorFraction, 16, 0, BLOCK_TYPE.SOLID)) {
				stoppingY = (Player.position[1] + currentVectorFraction) - ((Player.position[1] + currentVectorFraction) % BLOCK_SIZE);
				break;
			}
			currentVectorFraction += BLOCK_SIZE;
		}
		if (stoppingY) {
			Player.position[1] = stoppingY;
			if (Player.isInAir) {
				Player.currentSpeed = 0;
				checkIfCurrentCrateBreaks(t);
			}
			Player.isInAir = false;
			Player.verticalSpeed = 0;
		} else if (!isAABBOverBlock(Player.position[0] - 16, Player.position[1] - 32, 16, 32, BLOCK_TYPE.LADDER)) {
			Player.verticalSpeed += 1;
			Player.isInAir = true;
			Player.position[1] += Player.verticalSpeed;
		} else {
			Player.isInAir = false;
		}

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

		// Update Crow's position
		updateMovingPosition(Crow, CROW_MOVEMENT_THRESHOLD);

		// Update Cat's position
		if (Cat.position) {
			if (distance(Player.position, Cat.position) < 15) {
				getCurrentCrate() && breakCurrentCrate(getCurrentCrate(), t);
			}
			if (distance(Crow.position, Cat.position) < 15) {
				stunCrow(t);
			}
			if (Cat.nextCatMovement < t) {
				showCat(t);
			}
			updateMovingPosition(Cat, CROW_MOVEMENT_THRESHOLD);
		}


		// Check if Crow is inside player's radius
		Crow.isInWarningZone = isCrowInPlayerWarningZone();

		// Update Laser's position
		if (Granny.position) {
			var laserTargetPosition = isPositionOnBlock(Crow.position, BLOCK_TYPE.NEST) ? Granny.startingLaserPosition : Crow.position,
				laserToCrowAngle = getDirectionAngle(Granny.laserPosition, laserTargetPosition),
				tangentSide = Granny.laserPosition[0] > laserTargetPosition[0] ? -1 : 1;
			if (Math.abs(laserTargetPosition[0] - Granny.laserPosition[0]) > LASER_MOVEMENT_THRESHOLD || Math.abs(laserTargetPosition[1] - Granny.laserPosition[1]) > LASER_MOVEMENT_THRESHOLD) {
				Granny.laserPosition[0] += Math.cos(laserToCrowAngle) * tangentSide * LASER_SPEED;
				Granny.laserPosition[1] += Math.sin(laserToCrowAngle) * tangentSide * LASER_SPEED;
			}
		}

		if ((isCrowInPlayerDamageZone() || isAABBCollidingWithBlock(Crow.position[0], Crow.position[1], 0, 0, BLOCK_TYPE.ROOF) || (Granny.position && (distance(Granny.laserPosition, Crow.position) < LASER_MOVEMENT_THRESHOLD))) && Crow.stunnedTimeout < t) {
			stunCrow(t);
		}
	}

	//
	// GRAPHICS
	//

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

	function drawCat() {
		if (Cat.position) {
			drawImage(distance(Cat.position, Cat.nextPosition) > 5 ? IMAGE_MAP_DATA_NAMES.CAT_MOVING : IMAGE_MAP_DATA_NAMES.CAT, Cat.position[0] - 8, Cat.position[1]);
		}
	}

	function drawCrow(t) {
		if (Game.state === GAME_STATE.PLAYING) {
			if (!(Crow.stunnedTimeout > t && Math.floor(t / 100) % 2 === 0)) {
				drawAnim(IMAGE_MAP_DATA_NAMES.CROW, Crow.position[0] - 8, Crow.position[1] - 8, 2, false, t);
			}
		} else {
			drawAnim(IMAGE_MAP_DATA_NAMES.CROW, Crow.position[0] - 8, Crow.position[1] - 8, 0);
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

		if (Game.currentLevel[LEVEL_PARAMS.INSTRUCTIONS]) {
			for (var instr = 0; instr < Game.currentLevel[LEVEL_PARAMS.INSTRUCTIONS].length; instr++) {
				printText(ctx, Game.currentLevel[LEVEL_PARAMS.INSTRUCTIONS][instr][2], Game.currentLevel[LEVEL_PARAMS.INSTRUCTIONS][instr][0], Game.currentLevel[LEVEL_PARAMS.INSTRUCTIONS][instr][1], 10, 'black');
			}
		}
	}

	function drawLaser() {
		if (Granny.position) {
			ctx.fillStyle = 'red';
			ctx.fillRect(Granny.laserPosition[0] - 1, Granny.laserPosition[1] - 1, 2, 2);
			ctx['beginPath']();
			ctx['arc'](Granny.laserPosition[0], Granny.laserPosition[1], 5, 0, 360);
			ctx['lineWidth'] = 2;
			ctx['strokeStyle'] = 'red';
			ctx['stroke']();
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

	function drawPlayer(t) {
		if (Game.state === GAME_STATE.PLAYING) {
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
			ctx.drawImage(cur.image, Player.facingLeft ? cur.position[0] + 2 : cur.position[0] - 15 - cur.size, cur.position[1] - 10);
		}

		if (Crow.isInWarningZone) {
			ctx['beginPath']();
			ctx['arc'](Player.position[0], Player.position[1], getDamageRadius(), 0, 360);
			ctx['lineWidth'] = 2;
			ctx['strokeStyle'] = '#f09';
			ctx['stroke']();
		}
	}

	function drawStatus(t) {
		if (Game.state === GAME_STATE.PLAYING) {
			ctx.fillStyle = '#00deff';
			ctx.fillText("BOY", 10, 396);
			ctx.fillStyle = 'red';
			ctx.fillText("CROW", 600, 12);
			ctx.fillStyle = 'white';

			// Boy's status
			ctx.fillText("SPEED: " + getPlayerSpeed() + "   BOOST: " + Math.max(0, Math.ceil((Player.speedBoostTimeout - t) / 1000)) + "   TIME: " + Math.max(0, Math.ceil((Game.time - t) / 1000)) + "   CANDIES: " + Player.candies + "   CRATES: " + Player.crates, 50, 396);

			// Crow's status
			ctx.fillText("SHOTS: " + Crow.shots + "   STUN: " + Math.max(0, Math.ceil((Crow.stunnedTimeout - t) / 1000)) + "   HEALTH: " + Crow.health, 410, 12);
		} else if (Game.state === GAME_STATE.EDIT) {
			ctx.fillStyle = 'white';
			ctx.fillText("< > CHANGE BLOCK   G: GRANNY   C: CRATES   T: TIME (" + Levels[selectedLevel][LEVEL_PARAMS.TIME] + ")   N: NAME (" + Levels[selectedLevel][LEVEL_PARAMS.NAME] + ")" + (isMobileDevice ? '   1: PAINT   2: TOGGLE PAINT' : ''), 12, 12);
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
		// TODO move to an onResize
		Game.canvasBoundingRect = canvas.getBoundingClientRect();

		clearColor();
		drawMap();
		drawEnvironment();
		drawCat();
		drawPlayer(t);
		drawCrow(t);
		drawLaser();
		drawStatus(t);
		if (Game.state === GAME_STATE.MENU) {
			ctx.drawImage(MenuCanvas, 0, 0);
		}
		if (Game.state === GAME_STATE.EDIT) {
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



	/*////////////////////////////////////////
	 *
	 * Initialization
	 *
	 */ ///////////////////////////////////////

	//
	// GRAPHICS
	//
	ImageMap.onload = function () {
		FlippedImageMap.width = imageMapWidth = ImageMap.naturalWidth;
		FlippedImageMap.height = ImageMap.naturalHeight;
		var imCtx = FlippedImageMap.getContext('2d');
		imCtx.translate(ImageMap.naturalWidth, 0);
		imCtx.scale(-1, 1);
		imCtx.drawImage(ImageMap, 0, 0);
	};
	ImageMap.src = 'img/imgmap.png';

	//
	// INPUT
	//
	window.addEventListener('keyup', KeyHandler.onKeyUp, false);
	window.addEventListener('keydown', KeyHandler.onKeyDown, false);

	if (isMobileDevice) {
		function touchstart() {
			if (Game.state === GAME_STATE.MENU) {
				startGame();
			}
		}
		addEvent(canvas, 'touchstart', touchstart);
		addEvent(canvas, 'MSPointerDown', touchstart);


		bindButtonToCustomFunction('s', function () {
			if (Game.state === GAME_STATE.MENU) {
				KeyHandler.onKeyDown({
					'keyCode': KEYCODES.DELETE
				});
			} else {
				crowShoot();
			}
		}, function () {
			KeyHandler.onKeyUp({
				'keyCode': KEYCODES.DELETE
			});
		});

		bindButtonToCustomFunction('e', function (evt) {
			if (Game.state === GAME_STATE.MENU) {
				KeyHandler.onKeyDown({
					'keyCode': KEYCODES.EXPORT_LEVEL
				});
			} else {
				crowEat(evt);
			}
		}, function () {
			KeyHandler.onKeyUp({
				'keyCode': KEYCODES.EXPORT_LEVEL
			});
		});

		var dPad = document.getElementById('o'),
			dPadDivPosition = dPad.getBoundingClientRect(),
			dPadCenter = [100, 100],
			isTouchingDPad = false,
			touchPositions,
			dPadHandler = function (evt) {
				evt.preventDefault();
				touchPositions = evt.changedTouches || evt;
				// TODO move this line to onResize
				dPadDivPosition = dPad.getBoundingClientRect(),
				isTouchingDPad = true;
			};
		addEvent(dPad, 'touchstart', dPadHandler);
		addEvent(dPad, 'MSPointerDown', dPadHandler);
		addEvent(dPad, 'touchmove', dPadHandler);
		addEvent(dPad, 'MSPointerMove', dPadHandler);
		addEvent(dPad, 'touchend', function (evt) {
			evt.preventDefault();
			isTouchingDPad = false;
		});
		addEvent(dPad, 'MSPointerUp', function (evt) {
			evt.preventDefault();
			isTouchingDPad = false;
		});

		bindButtonToCustomFunction('p', function () {
			KeyHandler.onKeyDown({
				'keyCode': (Game.state === GAME_STATE.MENU) ? KEYCODES.IMPORT_LEVEL : KEYCODES.INTERACT
			});
		}, function () {
			KeyHandler.onKeyUp({
				'keyCode': (Game.state === GAME_STATE.MENU) ? KEYCODES.IMPORT_LEVEL : KEYCODES.INTERACT
			});
		});

		bindButtonToKeyCode('a', KEYCODES.EAT);
		bindButtonToKeyCode('l', KEYCODES.LEFT);
		bindButtonToKeyCode('u', KEYCODES.UP);
		bindButtonToKeyCode('r', KEYCODES.RIGHT);
		bindButtonToKeyCode('d', KEYCODES.DOWN);

		bindButtonToKeyCode('g', KEYCODES.GRANNY);
		bindButtonToKeyCode('c', KEYCODES.CRATES);
		bindButtonToKeyCode('t', KEYCODES.TIME);
		bindButtonToKeyCode('n', KEYCODES.NAME);

		addEvent(document.body, 'contextmenu', function (evt) {
			evt.preventDefault();
		}, false);

	} else {
		addEvent(canvas, 'click', crowShoot);
		addEvent(canvas, 'contextmenu', crowEat);

		addEvent(canvas, 'mousedown', function (evt) {
			if (evt.which === 1) isLeftMouseButtonDown = true;
			if ((Game.state === GAME_STATE.EDIT) && isLeftMouseButtonDown) {
				crowShoot();
			}
		});

		addEvent(canvas, 'mouseup', function (evt) {
			if (evt.which === 1) isLeftMouseButtonDown = false;
		});

		addEvent(canvas, 'mousemove', function (evt) {
			var tempCurMousePos = getCanvasRelativeCoords(evt);
			currentMousePosition = [tempCurMousePos[0], tempCurMousePos[1]];
			if (Game.state === GAME_STATE.PLAYING) { // Update the crow's position
				var newCrowPosition = getCanvasRelativeCoords(evt);
				Crow.nextPosition = newCrowPosition.slice();
			} else if ((Game.state === GAME_STATE.EDIT) && isLeftMouseButtonDown) {
				crowShoot();
			}
		});
	}

	//
	// AUDIO
	//
	for (var s = 0; s < NOTES_CDEFGABC.length; s++) {
		introTheme[s] = jsfxlib.createWave(["synth", 0.0000, 0.4000, 0.0000, 0.2080, 0.0000, 0.1200, 20.0000, NOTES_CDEFGABC[s], 2400.0000, 0.0000, 0.0000, 0.0000, 0.0100, 0.0003, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.1000, 0.0000]);
	}
	introThemeString = INTRO_THEME.slice();

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

	//
	// LOAD THE FIRST LEVEL
	//
	resetGame(selectedLevel);



	/*////////////////////////////////////////
	 *
	 * Start the game loop
	 *
	 */ ///////////////////////////////////////
	(function gameLoop(t) {
		processInput(t);
		update(t);
		render(t);

		window.requestAnimationFrame(gameLoop);
	})();
})();