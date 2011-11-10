var urlMap = { };

exports = {
	get : function(url, handler) {
		urlMap[url] = handler;
	}
};