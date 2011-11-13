var http = require('http'),
	Chat = require('./chat'),
	chat = new Chat(),
	url = require('url'),	
	mUtil = require('./mUtil');

var HOST = 'localhost',
	PORT = 3000,
	CLIENT_PATH = __dirname + '/../client';

var urlMap = {
	'/' : mUtil.staticHanlder.bind(null, CLIENT_PATH +  '/index.html'),
	'/app.js' : mUtil.staticHanlder.bind(null, CLIENT_PATH + '/app.js'),
	'/post' : function(req, res) {
		var queryObj = mUtil.getQueryObject(req.url);
		if(chat.isValidModel(queryObj)) {
			chat.addMessage(queryObj);
			chat.sendSuccess(res);
		} else {
			// TODO error
		}
	},
	
	'/login' : function(req, res) {
		var queryObj = mUtil.getQueryObject(req.url);
		chat.addUser(queryObj.name, res);
	},	
	
	'/leave' : function(req, res) {		
		var queryObj = mUtil.getQueryObject(req.url);
		chat.removeUser(queryObj.name);		
	}
}

var sseMap = {
	'/events' : function(req, res) {
		var name = mUtil.getQueryObject(req.url).name;
		if(!name || !chat.hasSession(name) ) {
			console.log('invalid name : ' + name);
			return;
		}
		console.log('valid name : ' + name);
		
		
		function constructSSE(res, id, data) {
		  	res.write('id: ' + id + '\n');
		  	res.write("data: " + data + '\n\n');
		}
		
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
	  	});
		// TODO : if there is last-id, 
		chat.updateHandler(name, req, res);				
		// 	  	var id = (new Date()).toLocaleTimeString();
		// var since = new Date();
		// chat.on('change', function(timeStamp) {
		// 	var msgs = chat.getJSONSince(since);
		// 	//res.write('data: ' + msgs);
		// 	constructSSE(res, id, msgs);
		// 	since = timeStamp;
		// });
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
		console.log('isSSE');
		var pathName = mUtil.getPathString(req.url);
		handler = sseMap[pathName] || mUtil.notFound;		
	} else if ( isGetOrHead(req.method) ) {		
		var pathName = mUtil.getPathString(req.url);
		handler = urlMap[pathName] || mUtil.notFound;		
	}
	handler(req, res);		
	
}).listen(PORT, HOST);
console.log('Server running at http://' + HOST);

