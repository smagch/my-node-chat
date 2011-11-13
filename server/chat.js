var events = require('events');
var messages = [ ];
var users = { };


function Chat() {
	events.EventEmitter.call(this);
	this._limitNumMsg = 30;
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

function handleSSE(res, model) {
	function constructSSE(res, id, data) {
	  	res.write('id: ' + id + '\n');
	  	res.write("data: " + data + '\n\n');
	}
	console.log('handleSSE');
	console.log('name : ' + model.name);
	console.log('msg : ' + model.msg);
	// TODO : check id

  	// TODO : if there is last-event-id, use getJSONSince
	// if not, just broadcast message
	var now = new Date();
	var id = now.toLocaleTimeString();
	var msgs = JSON.stringify([ model ]);	
	constructSSE(res, id, msgs)	
}



Chat.prototype = {
	__proto__ : events.EventEmitter.prototype,
	
	set limitNumMsg( value ) {
		this._limitNumMsg = value;
	},

	get limitNumMsg() {
		return this._limitNumMsg;
	},
	
	hasSession : function(name) {
		return !!users[name];
	},
	
	isValidModel : function(model) {
		return model.name && users[model.name] && model.msg ;
	},
	
	addMessage : function(model) {
		//var model = createModel(name, msg);		
		model.timeStamp = new Date();
		messages.push(model);
		while( messages.length > this._limitNumMsg ) {
			messages.shift();
		}		
		//this.emit('change', model.timeStamp);
		
		console.log('this.listeners("change").length : ' + this.listeners("change").length);
		this.emit('change', model);
	},
	
	sendSuccess : function(res) {
		var body = 'Success';
	  	res.writeHead( 200, {
			"Content-Type": "text/json",
			"Content-Length": body.length 
		});
		res.end(body);
	},
	
	sendFail : function(res, msg) {
		var body = new Buffer( msg || 'Fail');
		res.writeHead( 400, {
			"Content-Type": "text/json",
			"Content-Length": body.length 
		});
		res.end(body);
	},	
	
	removeUser : function(name) {
		if(users[name]) {
			delete users[name];		
			this.addMessage(name, name + ' leave');
		}
	},
	
	addUser : function(name, res) {
		if(!name || users[name]) {			
			this.sendFail(res, 'the name is already is used' );
			return;
		}		
		users[name] = 1;
		this.addMessage(name, name + ' join');
		this.sendSuccess(res);				
	},
	
	updateHandler : function(name, req, res) {
		// TODO : require last event id
		if(!users[name]) {
			return;
		}
		req.once('close', this.removeHandler.bind(this, name) );
		this.removeHandler(name);	
		console.log('updateHandler');
		res.writeHead(200, {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
	  	});	
		this.addListener('change', handleSSE.bind(null, res) );		
	},	
	
	removeHandler : function(name) {		
		var handler = users[name];
		if(handler && handler !== 1) {
			console.log('removeHandler : ' + name );
			this.removeListener('change', handler );			
		}
	},
	
	getJSONSince : function(timeStamp) {
		var msgs = [ ];
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

