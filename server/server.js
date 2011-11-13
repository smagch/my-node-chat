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
			chat.addMessage(queryObj.id, queryObj.msg);
			chat.sendSuccess(res);
		} else {
			chat.sendFail(res, 'invalid id ' + queryObj.id);
		}
	},
	
	'/login' : function(req, res) {
		var queryObj = mUtil.getQueryObject(req.url);
		chat.addUser(queryObj.name, res);
	},	
	
	'/leave' : function(req, res) {		
		var queryObj = mUtil.getQueryObject(req.url);
		chat.removeUser(queryObj.id);		
	}
}

var sseMap = {
	'/events' : function(req, res) {
		var queryObj = mUtil.getQueryObject(req.url),
			id = queryObj.id;
		
		if( !chat.hasSession(id) ) {
			console.log('invalid id : ' + id);
			return;
		}		
		console.log('valid id : ' + id );					
		// TODO : if there is last-id, 
		chat.updateHandler(id, req, res);	
	}
}


http.createServer(function (req, res) {
	function isSseAccepted(accept) {
		return accept === 'text/event-stream';
	}
	function isGetOrHead(method) {
		return !!{GET : 1 , HEAD : 1}[method];
	}		
	var pathName = mUtil.getPathString(req.url),
		handler;
	if(isSseAccepted(req.headers.accept)) {
		console.log('isSSE');		
		handler = sseMap[pathName] || mUtil.notFound;
	} else if ( isGetOrHead(req.method) ) {		
		handler = urlMap[pathName] || mUtil.notFound;
	}
	handler(req, res);		
	
}).listen(PORT, HOST);
console.log('Server running at http://' + HOST);

