var events = require('events');
var messages = [ ];
var users = { };

exports = chat;
// function model(name, msg) {
// 	if(msg) {
// 		this.msg = msg;
// 	}		
// 	this.timeStamp = new Date();
// 	this.name = name;
// }
function chat() {
	events.EventEmitter.call(this);
}

chat.prototype = {
	__proto__ : events.EventEmitter.prototype,
	
	addMsg : function(name, msg) {
		// process and emit event
		var model = {
			name : name,
			msg : msg,
			timeStamp : new Date()
		};
		
		messages.push(model);
		while(messages.length > 30) {
			messages.shift();
		}
		this.emit('change', model.timeStamp);
	},
	
	leave : function(name) {
		delete users[name];
		var model = {
			name : name,
			msg : 'leave : ' + name,
			timeStamp : new Date()
		}
		messages.push(model);
		this.emit('change', model.timeStamp);
	},
	
	join : function(name) {
		// TODO throw error if there is name
//		var uid = //hash//name;
		if(users[name]) {
			this.emit('error');
			return;			
		}		
		users[name] = 1;
		messages.push({
			msg : 'new user : ' + name,
			timeStamp : new Date()			
		});
		this.emit('change', new Date());
	},
	
	getJsonSince : function(timeStamp) {
		var msgTime;
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
// chat.on('msg', function() {
		
//})
// chat.on('leave', function() {
	
//})
//util.inherit( exports , events.EventEmitter);

