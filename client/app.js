(function(){
'use strict';
console.log('----------load app.js----------');
var loginBtn = document.querySelector('#loginBtn'),
	loginInput = document.querySelector('#loginInput'),
	chatContainer = document.querySelector('#chat_container'),
	chatInput = document.querySelector('#chat_input');
// TODO : id

var config = {
	name : '',
	id : NaN,
	isInitialized : false	
}
	
chatInput.style.display = 'none';
// TODO : callback for duplicate name
window.onunload = window.onbeforeunload = function(e) {
	if(config.isInitialized) {
		var req = new XMLHttpRequest();
		req.open('GET', '/leave?id=' + config.id );
		req.send(null);
	}	
}

function initialize(id, name) {
	config.id = id;
	config.name = name;
	config.isInitialized = true;
	
	chatInput.style.removeProperty('display');
	loginBtn.style.display = 'none';
	loginInput.style.display = 'none';
	chatInput.addEventListener('keydown', function(e) {
		if(e.keyIdentifier === 'Enter') {
			sendMessage();
		}
	}, false);
	
	var eventSource = new EventSource('/events?id=' + id);
	eventSource.onmessage = function(e) {
		//document.body.innerHTML += e.data + '<br>';
		// if (e.origin != 'http://example.com') {
		// 	    alert('Origin was not http://example.com');
		// 	    return;
		// 	  }
		console.log('e.data : ' + e.data);
	};
}



loginBtn.onclick = function(e) {
	var name = loginInput.value;
	if(util.isValidName(name)) {
		doLogin(name);
	}
	e.preventDefault();
	e.stopPropagation();
}

// var badRequestHandlers = {
// 	''
// }

function sendMessage() {	
	var msg = chatInput.value;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(e) {
		console.log('readyState : ' + req.readyState);				
		if(req.readyState == 4  && req.status == 200) {
			console.log('req.status : ' + req.status);			
			console.log('req.responseText : ' + req.responseText);
		} else if(req.readyState == 400 ) {
			var txt = req.responseText;
			if(txt) {
				console.log('bad request : ' + txt);
			}			
		}
	}
	req.open('GET', '/post?msg=' + msg + '&id=' + config.id);
	req.send(null);
}

function doLogin(name) {
	console.log('do request');
	var req = new XMLHttpRequest();
	//req.overrideMimeType("application/json"); 
	req.onreadystatechange = function(e) {
		console.log('readyState : ' + req.readyState);				
		if(req.readyState == 4  && req.status == 200) {
			console.log('req.status : ' + req.status);		
			console.log('req.responseText : ' + req.responseText);
			var responseObj = JSON.parse(req.responseText);
			if(!responseObj.id) {
				throw new Error('responseText has no session id')
			}
			initialize(responseObj.id, name);
		}
	}
	console.log('doRequest : ' + name);	
	req.open('GET', '/login?name='+ name, true);	
	req.send(null);
}

var util = {
	isValidName : function(name) {
		if(!name || !name.length || name.length > 50 ) { //|| // /[^\w_\-^!]/.exec(name) ) {
			console.log('invalid name : ' + name);
			return false;
		}
		return true;
	}
}


window.onsubmit = function(e) {
	console.log('window.onsubmit');
}

window.onclose = function(e) {
	
}



})();


