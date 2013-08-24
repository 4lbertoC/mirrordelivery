// CONSTANTS
var PORT = 3000,
	HOST = '127.0.0.1';

var http = require('http'),
	fs = require('fs'),
	server = http['createServer'](function (req, res) {

		if (req['method'] == 'OPTIONS') {
			console.log("OPTIONS ", req.url);
			res['writeHead'](200, {
				'Content-Type': 'text/html',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
				'Access-Control-Max-Age': '1800'
			});
			res['end']('options received');
		} else if (req['method'] == 'POST') {
			console.log("POST", req.url);
			var body = '';
			req['on']('data', function (data) {
				body += data;
				console.log("Partial body: " + body);
			});
			req['on']('end', function () {
				console.log("Body: " + body);
			});
			res['writeHead'](200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
				'Access-Control-Max-Age': '1800'
			});
			res['end']('{}');
		} else {
			console.log("GET", req.url);
			var html = fs['readFileSync']('index.html');
			res['writeHead'](200, {
				'Content-Type': 'text/html'
			});
			res['end'](html);
		}

	});

server['listen'](PORT, HOST);
console.log('Listening at http://' + HOST + ':' + PORT);