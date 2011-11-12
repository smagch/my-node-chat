var http = require('http'),
	url = require('url'),
	qs = require("querystring"),
	Chat = require('./chat'),
	chat = new Chat(),
	mUtil = require('./mUtil');


var HOST = 'localhost',
	PORT = 3000,
	CLIENT_PATH = __dirname + '/../client';

var urlMap = {
	'/' : mUtil.staticHanlder.bind(null, CLIENT_PATH +  '/index.html'),
	'/app.js' : mUtil.staticHanlder.bind(null, CLIENT_PATH + '/app.js'),
	'/post' : function(req, res) {
		// id from req
		// name from id
		// 
		var queryObj = qs.parse(url.parse(req.url).query);
		console.log('queryObj.name : ' + queryObj.name);
		console.log('queryObj.msg : ' + queryObj.msg);		
		chat.addMessage(queryObj.name, queryObj.msg);
		mUtil.simpleJson(res, { });
	},
	
	'/login' : function(req, res) {
		// chat.join(qString.name);
		console.log('login');

		var qString = qs.parse(url.parse(req.url).query);
		console.log('qString : ' + qString);
		console.log('qString.name : ' + qString.name);	
		// chat.getUsers
		chat.join(qString.name);
		mUtil.simpleJson(res, { q : 'this_is_test'});
	},	
	
	'/leave' : function(req, res) {
		
	}
}

var sseMap = {
	'/events' : function(req, res) {
		function constructSSE(res, id, data) {
		  	res.write('id: ' + id + '\n');
		  	res.write("data: " + data + '\n\n');
		}
		
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
	  	});

	  	var id = (new Date()).toLocaleTimeString();

	  // Sends a SSE every 5 seconds on a single connection.
	  	// setInterval(function() {
	  	// 	console.log('this is Interval : ');		
	  	// 	constructSSE(res, id, (new Date()).toLocaleTimeString());
	  	//   	}, 1000);

		// register event
		// var since = new Date();
		var since = new Date();
		chat.on('change', function(timeStamp) {
			var msgs = chat.getJSONSince(since);
			//res.write('data: ' + msgs);
			constructSSE(res, id, msgs);
			since = timeStamp;
		});
	}
}


http.createServer(function (req, res) {
	function isSseAccepted(accept) {
		return accept === 'text/event-stream';
	}
	function isGetOrHead(method) {
		return !!{GET : 1 , HEAD : 1}[method];
	}
	
	var handler;
	if(isSseAccepted(req.headers.accept)) {
		handler = sseMap[req.url] || mUtil.notFound;		
	} else if ( isGetOrHead(req.method) ) {
		var pathName = 	url.parse(req.url).pathname;
		handler = urlMap[pathName] || mUtil.notFound;		
	}
	handler(req, res);		
	
}).listen(PORT, HOST);
console.log('Server running at http://' + HOST);

