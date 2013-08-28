// CONSTANTS
var PORT = process['env']['PORT'] || 3000,
	FILENAME = 'levels.json';

var http = require('http'),
	fs = require('fs'),
	crypto = require('crypto');

var OK_REQUEST_HEADERS = {
	'Content-Type': 'text/html',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
	'Access-Control-Max-Age': '1800'
};

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

	// console.log(levels);
	var server = http['createServer'](function (req, res) {
		console.log(req['method'], req['url']);
		if (req['method'] == 'OPTIONS') {
			res['writeHead'](200, OK_REQUEST_HEADERS);
			res['end']('options received');
		} else if (req['method'] == 'POST' && req['url'] === '/addLevel') {
			var body = '';

			req['on']('data', function (data) {
				body += data;
			});
			req['on']('end', function () {
				try {
					var levelInfo = JSON.parse(body);

					var md5sum = crypto['createHash']('md5');
					md5sum['update'](body);
					var levelHash = md5sum['digest']('hex');
					console.log("Added level with hash: " + levelHash);

					var level = {
						expireTime: Date.now() + 1000 * 60 * 60 * 24 * 7, // Keep it for a week
						lvl: body
					};

					levels[levelHash] = level;

					fs['writeFileSync'](FILENAME, JSON.stringify(levels));

					res['writeHead'](200, OK_REQUEST_HEADERS);
					res['end']('#' + levelHash);
				} catch (e) {
					console.log("Tried to add an invalid level: " + e['message']);
					res['writeHead'](400, {
						'Content-Type': 'text/html'
					});
					res['end']('Invalid Level Information');
				}
			});

		} else if (req['method'] == 'GET' && req['url'].indexOf('/getLevel') === 0) {
			var levelHash = req['url'].substr(req['url'].indexOf('/getLevel') + 10),
				level;
			console.log('Requested level with hash ' + levelHash, !! levels[levelHash]);
			res['writeHead'](200, OK_REQUEST_HEADERS);
			if (levels[levelHash]) {
				level = levels[levelHash].lvl;
			}
			res['end'](level);
		} else {
			res['writeHead'](400, {
				'Content-Type': 'text/html'
			});
			res['end']('Not Supported');
		}

	});

	server['listen'](PORT);
	console.log('Listening on port ' + PORT);
});