var events = require('events');

function Chat() {
	events.EventEmitter.call(this);
	this._limitNumMsg = 30;
	this._sessions = { };
	this._messages = [ ];
}

function createModel(name, msg) {
	return { 
		name : name,
		msg : msg,
		timeStamp : new Date()
	};
}

function logModel(model) {
	console.log('name : ' + model.name);
	console.log('msg : ' + model.msg);
	console.log('timeStamp : ' + model.timeStamp);
}

var SessionObject = (function(){
	function SessionObject(name) {
		this.name = name;
		this.handler = undefined;
	}
	SessionObject.prototype = {
		// set handler( value ) {
		// 		this._handler = value;
		// 	},
		// 
		// 	get handler() {
		// 		return this._handler;
		// 	}
	}	
	return SessionObject;
})();


function handleSSE(res, model) {
	function constructSSE(res, id, data) {
	  	res.write('id: ' + id + '\n');
	  	res.write("data: " + data + '\n\n');
	}
	console.log('handleSSE');

  	// TODO : if there is last-event-id, use getJSONSince
	// if not, just broadcast message
	var now = new Date();
	var id = now.toLocaleTimeString();
	var msgs = JSON.stringify([ model ]);	
	constructSSE(res, id, msgs)	
}

function getUid() {
	var id = (Math.random() * 0xFFFFFF << 0 ).toString(32) + 
			 (Math.random() * 0xFFFFFF << 0 ).toString(32);	
	return id;	
}

function sendSuccessWithId (id, res) {
	var obj = {id : id};
	var body = new Buffer(JSON.stringify(obj));
  	res.writeHead( 200, {
		"Content-Type": "text/json",
		"Content-Length": body.length 
	});
	res.end(body);
}

function sendText (code, res, msg) {
	var body = new Buffer( msg );
  	res.writeHead( code, {
		"Content-Type": "text/plain",
		"Content-Length": body.length 
	});
	res.end(body);
}


Chat.prototype = {
	__proto__ : events.EventEmitter.prototype,
	
	set limitNumMsg( value ) {
		this._limitNumMsg = value;
	},

	get limitNumMsg() {
		return this._limitNumMsg;
	},
	
	hasSession : function(id) {
		return !!this._sessions[id];
	},
	
	isValidModel : function(model) {
		return model.id && this._sessions[model.id];
	},
	
	addMessage : function(id, msg) {
		var name = this._sessions[id].name;		
		var model = createModel(name, msg);		
		model.timeStamp = new Date();
		var messages = this._messages;
		messages.push(model);
		while( messages.length > this._limitNumMsg ) {
			messages.shift();
		}			
		console.log('this.listeners("change").length : ' + this.listeners("change").length);
		this.emit('change', model);
	},
	
	sendSuccess : function(res, msg) {
		sendText(200, res, ( msg || 'Success') );
	},
	
	sendFail : function(res, msg) {
		sendText(400, res, ( msg || 'Fail') );
	},
	
	removeUser : function(id) {
		if(this._sessions[id]) {
			var name = this._sessions[id].name;
			console.log(name + ' is about to leave');
			this.addMessage( id , name + ' leave') ;
			
			this.removeHandler(id);
			delete this._sessions[id];						
		}
	},
	
	addUser : function(name, res) {
		if(!name || this._sessions[name]) {			
			this.sendFail(res, 'the name is already is used' );
			return;
		}
		var id = getUid();				
		this._sessions[id] = new SessionObject(name);
		sendSuccessWithId(id, res);	
		this.addMessage(id, name + ' join');
	},
	
	updateHandler : function(id, req, res) {
		// TODO : require last event id
		if(!this.hasSession(id)) {
			return;
		}
		console.log('updateHandler');
		req.once('close', this.removeHandler.bind(this, id) );		
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
	  	});
		this.removeHandler(id);	
		var handler = handleSSE.bind(null, res);
		this._sessions[id].handler = handler;
		this.addListener('change', handler);		
	},	
	
	removeHandler : function(id) {		
		var sessionObj = this._sessions[id];
		if(sessionObj && sessionObj.handler) {
			console.log('removeHandler : ' + id );
			this.removeListener('change', sessionObj.handler );
		}
	},
	
	getJSONSince : function(timeStamp) {
		var msgs = [ ],
			messages = this._messages;
		for(var i = messages.length - 1, msg = messages[i]; msg = messages[i] ; --i ) {
			if( timeStamp < msg.timeStamp ) {
				msgs.push(msg);
			} else {
				break;
			}
		}		
		return JSON.stringify(msgs);
	}
}



module.exports = Chat;

