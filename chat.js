var events = require('events');
var messages = [ ];
function model(name, msg) {
	if(msg) {
		this.msg = msg;
	}		
	this.timeStamp = new Date();
	this.name = name;
}

var proto = {
	addMsg : function(model) {
		// process and emit event
		model.timeStamp = new Date();
		messages.push(model);
		this.emit('msg');
	},
	leave : function() {
		this.emit('leave');
	},
	join : function() {
		this.emit('join');
	}	
}
// chat.on('msg', function() {
		
//})
// chat.on('leave', function() {
	
//})
util.inherit( exports , events.EventEmitter);

