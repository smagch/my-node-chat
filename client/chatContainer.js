window.ChatItem = (function(){
	var template = document.createElement('div');
	template.className = 'msg';
	template.innerHTML = 	'<div class=msg-name></div>' + 
							'<div class=msg-content></div>' + 
							'<div class=msg-time></div>';
							
	var ChatItem = {
		create : function() {
			var ret = template.cloneNode(true);			
			return ChatItem.decorate(ret);
		},
		
		decorate : function(div) {
			div.__proto__ = proto;
			init.call(this);
		},
		
		isChatItem : function(elem) {
			return elem.classList.contains('msg');
		}
	}
	
	function init() {
		
	}

	var TRANSITION_END = 'webkitTransitionEnd';

	var proto = {
		__proto__ : HTMLDivElement.prototype,
		set name( value ) {
			this.querySelector('.msg-name').textContent = value;
		},

		get name() {
			return this.querySelector('.msg-name').textContent;
		},
		
		set msg( value ) {
			this.querySelector('.msg-content').textContent = value;
		},

		get msg() {
			return this.querySelector('.msg-content').textContent;
		},
		
		set time( value ) {
			this.querySelector('msg-time').textContent = value;
		},

		get time() {
			return this.querySelector('msg-time').textContent;
		},
		
		select : function() {
			this.classList.add('selected');
			// var h = this.clientHeight;
			// this.style.height = h;
			// this._h = h;
			// var self = this;
			// requestAnimationFrame(function() {				
			// 	self.classList.add('anim');
			// 	self.style.height = h * 1.5;
			// });
		},
		
		clearSelect : function() {
			this.classList.remove('selected');
			// var self = this;			
			// this.addEventListener( TRANSITION_END, 
			// 	function end(e) {
			// 		self.removeEventListener(TRANSITION_END, end, false);
			// 		self.classList.remove('anim');
			// 		self.style.removeProperty('height');
			// 	}, false 
			// );	
			// this.style.height = this._h;
		}
		
		
	}

	return ChatItem;
})();







window.ChatContainer = (function(){
	var ChatContainer = {
		decorate : function(div) {
			div.__proto__ = proto;
			init.call(div);
		},
		
		create : function() {
			var div = document.createElement('div');
			return ChatContainer.decorate(div);
		}
	}
	
	function init() {
		this.addEventListener('keydown', keyDownHandler, false);
		this.addEventListener('click', clickHandler, false);
		this._selectedItem = null;
	}

	function keyDownHandler(e) {
		console.log('keyDown');
		switch(e.keyIdentifier) {
			case 'Down' : 
				console.log('down');
				this.selectNext();
			break;
			case 'Up' : 
				console.log('up');
				this.selectPrevious();
			break;
			case 'Right' : 				
			
			break;
			case 'Left' : 				
			
			break;
			case 'Home' : 
				console.log('home');
				this.selectedItem = this.firstElementChild;
			break;
			case 'End' : 
				console.log('end');
				this.selectedItem = this.lastElementChild;
			break;
			default :			
		}
	}
	
	function clickHandler (e) {
		if(ChatItem.isChatItem(e.target)) {
			this.selectedItem = e.target;
		}
	}
	
	var proto = {
		constructor: ChatContainer,
		__proto__ : HTMLDivElement.prototype,
		
		// selectLastItem : function() {
		// 	clearSelect();
		// 	this.lastChild.select();
		// },
		// 
		// selectFirstItem : function() {
		// 	clearSelect();
		// 	this.firstChild.select();
		// },
		set selectedItem(item) {
			if(!item || item === this._selectedItem) {				
				return;
			}
			this.clearSelect();
			item.select();
			this._selectedItem = item;			
		},
		
		get selectedItem() {
			return this._selectedItem;
		},
		
		clearSelect : function() {
			if(this._selectedItem) {
				this._selectedItem.clearSelect();
			}
		},
		
		selectNext : function() {
			var currentItem = this._selectedItem;
			if( currentItem ) {
				var nextItem = currentItem.nextElementSibling;
				if(nextItem) {
					this.selectedItem = nextItem;
				}			
			}
		},
		
		selectPrevious : function() {
			var currentItem = this._selectedItem;
			if( currentItem ) {
				var pervItem = currentItem.previousElementSibling;
				if(pervItem) {
					this.selectedItem = pervItem;
				}			
			}
		},
		
		
		
		
		// append : function(obj) {
		// 			
		// 		},
		
		
	}
	return ChatContainer;
})();

