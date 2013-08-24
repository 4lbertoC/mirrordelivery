// CONSTANTS
var PORT = 3000,
	HOST = '127.0.0.1',
	FILENAME = 'levels.json';

var http = require('http'),
	fs = require('fs'),
	crypto = require('crypto');

fs['exists']('levels.json', function (exists) {
	if (!exists) {
		fs['writeFileSync'](FILENAME, '{}');
	}

	var levels = JSON.parse(fs['readFileSync'](FILENAME));
	for (var l in levels) {
		if (levels[l].expireTime < Date.now()) {
			levels[l] = undefined;
		}
	}

	console.log(levels);
	var server = http['createServer'](function (req, res) {

		if (req['method'] == 'OPTIONS' && req.url === '/addLevel') {
			console.log("OPTIONS ", req.url);
			res['writeHead'](200, {
				'Content-Type': 'text/html',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
				'Access-Control-Max-Age': '1800'
			});
			res['end']('options received');
		} else if (req['method'] == 'POST' && req.url === '/addLevel') {
			console.log("POST", req.url);
			var body = '';

			req['on']('data', function (data) {
				body += data;
			});
			req['on']('end', function () {
				try {
					var levelInfo = JSON.parse(body);

					var md5sum = crypto.createHash('md5');
					md5sum['update'](body);
					var levelHash = md5sum['digest']('hex');
					console.log("Added level with hash: " + levelHash);

					var level = {
						expireTime: Date.now() + 1000 * 60 * 60 * 24 * 7, // Keep it for a week
						lvl: body
					};

					levels[levelHash] = level;

					fs['writeFileSync'](FILENAME, JSON.stringify(levels));

					res['writeHead'](200, {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
						'Access-Control-Max-Age': '1800'
					});
					res['end'](HOST + '/getLevel/' + levelHash);
				} catch (e) {
					console.log("Tried to add an invalid level: " + e.message);
					res['writeHead'](400, {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
						'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
						'Access-Control-Max-Age': '1800'
					});
					res['end']('Invalid Level Information');
				}
			});

		} else if (req['method'] == 'GET' && req.url.indexOf('/getLevel') === 0) {
			console.log("GET", req.url);

			var html = 'ToDo'
			res['writeHead'](200, {
				'Content-Type': 'text/html'
			});
			res['end'](html);
		} else {
			res['writeHead'](400, {
				'Content-Type': 'text/html'
			});
			res['end']('Not Supported');
		}

	});

	server['listen'](PORT, HOST);
	console.log('Listening at http://' + HOST + ':' + PORT);
});