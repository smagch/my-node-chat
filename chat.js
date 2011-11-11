var events = require('events');
var messages = [ ];
var users = { };


function Chat() {
	events.EventEmitter.call(this);
}

Chat.prototype = {
	__proto__ : events.EventEmitter.prototype,
	
	addMessage : function(name, msg) {
		// process and emit event
		var model = createModel(name, msg);
		
		messages.push(model);
		while(messages.length > 30) {
			messages.shift();
		}
		
		this.emit('change', model.timeStamp);
	},
	
	leave : function(name) {
		delete users[name];		
		this.addMessage(name, name + ' leave');
		//var model = createModel(name, 'leave : ' + name);
		//messages.push(model);		
		//this.emit('change', model.timeStamp);
	},
	
	join : function(name) {
		// TODO throw error if there is name
//		var uid = //hash//name;
		if(users[name]) {
			this.emit('error', 'the name is already used');
			return;			
		}		
		users[name] = 1;
		this.addMessage(name, name + ' join');
//		var model = createModel(name, name + ' join');		
		//this.emit('change', model.timeStamp);
	},
	
	getJSONSince : function(timeStamp) {
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

function createModel(name, msg) {
	return { 
		name : name,
		msg : msg,
		timeStamp : new Date()
	};
}
//module.exports = new events.EventEmitter();
module.exports = new Chat();
// chat.on('msg', function() {
		
//})
// chat.on('leave', function() {
	
//})
//util.inherit( exports , events.EventEmitter);

