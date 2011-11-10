(function(){
'use strict';
var loginBtn = document.querySelector('#loginBtn'),
	loginInput = document.querySelector('#loginInput');

loginBtn.onclick = function(e) {
	var name = loginInput.value;
	if(isValidName(name)) {
		doRequest(name);
	}
	e.preventDefault();
	e.stopPropagation();
}

function doRequest(name) {
	console.log('do request');
	var req = new XMLHttpRequest();
	//req.overrideMimeType("application/json"); 
	req.onreadystatechange = function(e) {
		console.log('readyState : ' + req.readyState);				
		if(req.readyState == 4  && req.status == 200) {
			console.log('req.status : ' + req.status);			
			console.log('req.responseText : ' + req.responseText);
		}
	}
	console.log('doRequest : ' + name);	
	req.open('GET', '/login?name='+ name, true);	
	req.send(null);
	// req.send(JSON.stringify({
	// 		name : name
	// 	}));	
}

function load() {
	console.log('load');
}

function isValidName(name) {
	if(!name || !name.length || name.length > 50 ) { //|| // /[^\w_\-^!]/.exec(name) ) {
		console.log('invalid name : ' + name);
		return false;
	}
	return true;
}


window.onsubmit = function(e) {
	console.log('window.onsubmit');
}
var data = {
	msg : 'hello',
	time : '20110101',
	name : 'tom'
}
// join, left
// @param {Array<model>}
function update(data) {
	//if(data.name === )
	data.forEach(function(model) {
		var msg = updateMap[model.msg] || model.msg;
		
	});
}

var updateMap = {
	join : 'join',
	part : 'leave'	
}
// 
// ChatEvent : join, msg, part
// CHT.subscribe( target, 'join', function(e) {
//		e.data = {name : 'hoge', time : ''};
//})
// CHT.subscribe( target, 'leave', function(e) {
	//
//}) 
//


})();


