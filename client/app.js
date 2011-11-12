(function(){
'use strict';
console.log('----------load app.js----------');
var loginBtn = document.querySelector('#loginBtn'),
	loginInput = document.querySelector('#loginInput'),
	chatContainer = document.querySelector('#chat_container'),
	chatInput = document.querySelector('#chat_input'),
	
	eventSource = new EventSource('/events');

var config = {
	name : ''	
}
	
chatInput.style.display = 'none';

function initialize(name) {
	chatInput.style.removeProperty('display');
	loginBtn.style.display = 'none';
	loginInput.style.display = 'none';
	config.name = name;
	chatInput.addEventListener('keydown', function(e) {
		if(e.keyIdentifier === 'Enter') {
			sendMessage();
		}
	}, false);
}

eventSource.onmessage = function(e) {
	//document.body.innerHTML += e.data + '<br>';
	console.log('e.data : ' + e.data);
};

loginBtn.onclick = function(e) {
	var name = loginInput.value;
	if(util.isValidName(name)) {
		doLogin(name);
	}
	e.preventDefault();
	e.stopPropagation();
}

function sendMessage() {	
	var msg = chatInput.value;
	var req = new XMLHttpRequest();
	req.onreadystatechange = function(e) {
		console.log('readyState : ' + req.readyState);				
		if(req.readyState == 4  && req.status == 200) {
			console.log('req.status : ' + req.status);			
			console.log('req.responseText : ' + req.responseText);
		}
	}
	req.open('GET', '/post?msg=' + msg + '&name=' + config.name);
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
			initialize(name);
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


