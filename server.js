var http = require('http'),
	url = require('url'),
	path = require('path'),
	qs = require("querystring"),
	chat = require('./chat'),	
	readFileSync = require('fs').readFileSync;

var HOST = 'localhost',
	PORT = 3000;

// for( var url in urlMap) {
// 	console.log('url : ' + url);
// 	console.log('urlMap[url] : ' + urlMap[url]);	
// }
// for( var url in urlMap ) {
// 	if(typeof urlMap[url] === 'string' ) {
// 		console.log('urlMap[url] : ' + urlMap[url]);
// 		var fileName = new String(urlMap[url]);
// 		urlMap[url] = staticHanlder.bind(null, fileName);
// 	}
// }
// for( var url in urlMap) {
// 	console.log('url : ' + url);
// 	console.log('urlMap[url] : ' + urlMap[url]);	
// }
var urlMap = {
	'/' : staticHanlder.bind(null,'index.html'),
	'/app.js' : staticHanlder.bind(null,'app.js'),
	'/post' : function(req, res) {
		// id from req
		// name from id
		// 
		var queryObj = qs.parse(url.parse(req.url).query);
		console.log('queryObj.name : ' + queryObj.name);
		console.log('queryObj.msg : ' + queryObj.msg);		
		chat.addMessage(queryObj.name, queryObj.msg);
		simpleJson(res, { });
	},
	
	'/login' : function(req, res) {
		// chat.join(qString.name);
		console.log('login');

		var qString = qs.parse(url.parse(req.url).query);
		console.log('qString : ' + qString);
		console.log('qString.name : ' + qString.name);	
		// chat.getUsers
		chat.join(qString.name);
		simpleJson(res, { q : 'this_is_test'});
	},	
	
	'/leave' : function(req, res) {
		
	}
}

function simpleJson (res, obj) {
  var body = new Buffer(JSON.stringify(obj));
  res.writeHead( 200, { "Content-Type": "text/json"
                      , "Content-Length": body.length
                      });
  res.end(body);
};	


function notFound(req, res) {
	var NOT_FOUND = "Not Found\n";
  	res.writeHead(404, { "Content-Type": "text/plain"
                     , "Content-Length": NOT_FOUND.length
                     });
  	res.end(NOT_FOUND);
}

http.createServer(function (req, res) {
	if (req.headers.accept && req.headers.accept == 'text/event-stream') {
		if (req.url == '/events') {
		    sendSSE(req, res);
		} else {
			notFound(req, res);
		}
		return;
	} 		
	
	if (req.method === "GET" || req.method === "HEAD") {
		console.log('req.url : ' + req.url);
		console.log('url.parse(req.url) : ' + url.parse(req.url));		
		var pathName = 	url.parse(req.url).pathname;
		console.log('pathName : ' + pathName);
		//notFound(req, res);
		var handler = urlMap[pathName] || notFound;
		handler(req, res);		
	}
	
}).listen(PORT, HOST);
console.log('Server running at http://' + HOST);


function sendSSE(req, res) {
 	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
  	});

  	var id = (new Date()).toLocaleTimeString();

  // Sends a SSE every 5 seconds on a single connection.
  	// setInterval(function() {
  	// 	console.log('this is Interval : ');		
  	// 	constructSSE(res, id, (new Date()).toLocaleTimeString());
  	//   	}, 1000);
	
	// register event
	// var since = new Date();
	var since = new Date();
	chat.on('change', function(timeStamp) {
		var msgs = chat.getJSONSince(since);
		//res.write('data: ' + msgs);
		constructSSE(res, id, msgs);
		since = timeStamp;
	});
  	//constructSSE(res, id, (new Date()).toLocaleTimeString());
}

function constructSSE(res, id, data) {
  	res.write('id: ' + id + '\n');
  	res.write("data: " + data + '\n\n');
}


function staticHanlder (fileName, req, res) {
  	var body, 
		headers,
  		content_type = mime.lookupExtension(path.extname(fileName));
//	console.log('staticHandler');	
	var buffer = readFileSync(fileName);	
	body = buffer;
	headers =  { "Content-Type": content_type,
               	"Content-Length": body.length };
//	console.log('body.length : ' + body.length);
	res.writeHead(200, headers);
	res.end(req.method === "HEAD" ? "" : body);	
}

/*
 *
 *
*/

// var net = require('net');
// 
// var server = net.createServer(function (socket) {
//   socket.write("Echo server\r\n");
//   socket.pipe(socket);
// });
// 
// server.listen(1337, HOST);



var mime = {
  // returns MIME type for extension, or fallback, or octet-steam
  lookupExtension : function(ext, fallback) {
    return mime.TYPES[ext.toLowerCase()] || fallback || 'application/octet-stream';
  },

  // List of most common mime-types, stolen from Rack.
  TYPES : { ".3gp"   : "video/3gpp"
          , ".a"     : "application/octet-stream"
          , ".ai"    : "application/postscript"
          , ".aif"   : "audio/x-aiff"
          , ".aiff"  : "audio/x-aiff"
          , ".asc"   : "application/pgp-signature"
          , ".asf"   : "video/x-ms-asf"
          , ".asm"   : "text/x-asm"
          , ".asx"   : "video/x-ms-asf"
          , ".atom"  : "application/atom+xml"
          , ".au"    : "audio/basic"
          , ".avi"   : "video/x-msvideo"
          , ".bat"   : "application/x-msdownload"
          , ".bin"   : "application/octet-stream"
          , ".bmp"   : "image/bmp"
          , ".bz2"   : "application/x-bzip2"
          , ".c"     : "text/x-c"
          , ".cab"   : "application/vnd.ms-cab-compressed"
          , ".cc"    : "text/x-c"
          , ".chm"   : "application/vnd.ms-htmlhelp"
          , ".class"   : "application/octet-stream"
          , ".com"   : "application/x-msdownload"
          , ".conf"  : "text/plain"
          , ".cpp"   : "text/x-c"
          , ".crt"   : "application/x-x509-ca-cert"
          , ".css"   : "text/css"
          , ".csv"   : "text/csv"
          , ".cxx"   : "text/x-c"
          , ".deb"   : "application/x-debian-package"
          , ".der"   : "application/x-x509-ca-cert"
          , ".diff"  : "text/x-diff"
          , ".djv"   : "image/vnd.djvu"
          , ".djvu"  : "image/vnd.djvu"
          , ".dll"   : "application/x-msdownload"
          , ".dmg"   : "application/octet-stream"
          , ".doc"   : "application/msword"
          , ".dot"   : "application/msword"
          , ".dtd"   : "application/xml-dtd"
          , ".dvi"   : "application/x-dvi"
          , ".ear"   : "application/java-archive"
          , ".eml"   : "message/rfc822"
          , ".eps"   : "application/postscript"
          , ".exe"   : "application/x-msdownload"
          , ".f"     : "text/x-fortran"
          , ".f77"   : "text/x-fortran"
          , ".f90"   : "text/x-fortran"
          , ".flv"   : "video/x-flv"
          , ".for"   : "text/x-fortran"
          , ".gem"   : "application/octet-stream"
          , ".gemspec" : "text/x-script.ruby"
          , ".gif"   : "image/gif"
          , ".gz"    : "application/x-gzip"
          , ".h"     : "text/x-c"
          , ".hh"    : "text/x-c"
          , ".htm"   : "text/html"
          , ".html"  : "text/html"
          , ".ico"   : "image/vnd.microsoft.icon"
          , ".ics"   : "text/calendar"
          , ".ifb"   : "text/calendar"
          , ".iso"   : "application/octet-stream"
          , ".jar"   : "application/java-archive"
          , ".java"  : "text/x-java-source"
          , ".jnlp"  : "application/x-java-jnlp-file"
          , ".jpeg"  : "image/jpeg"
          , ".jpg"   : "image/jpeg"
          , ".js"    : "application/javascript"
          , ".json"  : "application/json"
          , ".log"   : "text/plain"
          , ".m3u"   : "audio/x-mpegurl"
          , ".m4v"   : "video/mp4"
          , ".man"   : "text/troff"
          , ".mathml"  : "application/mathml+xml"
          , ".mbox"  : "application/mbox"
          , ".mdoc"  : "text/troff"
          , ".me"    : "text/troff"
          , ".mid"   : "audio/midi"
          , ".midi"  : "audio/midi"
          , ".mime"  : "message/rfc822"
          , ".mml"   : "application/mathml+xml"
          , ".mng"   : "video/x-mng"
          , ".mov"   : "video/quicktime"
          , ".mp3"   : "audio/mpeg"
          , ".mp4"   : "video/mp4"
          , ".mp4v"  : "video/mp4"
          , ".mpeg"  : "video/mpeg"
          , ".mpg"   : "video/mpeg"
          , ".ms"    : "text/troff"
          , ".msi"   : "application/x-msdownload"
          , ".odp"   : "application/vnd.oasis.opendocument.presentation"
          , ".ods"   : "application/vnd.oasis.opendocument.spreadsheet"
          , ".odt"   : "application/vnd.oasis.opendocument.text"
          , ".ogg"   : "application/ogg"
          , ".p"     : "text/x-pascal"
          , ".pas"   : "text/x-pascal"
          , ".pbm"   : "image/x-portable-bitmap"
          , ".pdf"   : "application/pdf"
          , ".pem"   : "application/x-x509-ca-cert"
          , ".pgm"   : "image/x-portable-graymap"
          , ".pgp"   : "application/pgp-encrypted"
          , ".pkg"   : "application/octet-stream"
          , ".pl"    : "text/x-script.perl"
          , ".pm"    : "text/x-script.perl-module"
          , ".png"   : "image/png"
          , ".pnm"   : "image/x-portable-anymap"
          , ".ppm"   : "image/x-portable-pixmap"
          , ".pps"   : "application/vnd.ms-powerpoint"
          , ".ppt"   : "application/vnd.ms-powerpoint"
          , ".ps"    : "application/postscript"
          , ".psd"   : "image/vnd.adobe.photoshop"
          , ".py"    : "text/x-script.python"
          , ".qt"    : "video/quicktime"
          , ".ra"    : "audio/x-pn-realaudio"
          , ".rake"  : "text/x-script.ruby"
          , ".ram"   : "audio/x-pn-realaudio"
          , ".rar"   : "application/x-rar-compressed"
          , ".rb"    : "text/x-script.ruby"
          , ".rdf"   : "application/rdf+xml"
          , ".roff"  : "text/troff"
          , ".rpm"   : "application/x-redhat-package-manager"
          , ".rss"   : "application/rss+xml"
          , ".rtf"   : "application/rtf"
          , ".ru"    : "text/x-script.ruby"
          , ".s"     : "text/x-asm"
          , ".sgm"   : "text/sgml"
          , ".sgml"  : "text/sgml"
          , ".sh"    : "application/x-sh"
          , ".sig"   : "application/pgp-signature"
          , ".snd"   : "audio/basic"
          , ".so"    : "application/octet-stream"
          , ".svg"   : "image/svg+xml"
          , ".svgz"  : "image/svg+xml"
          , ".swf"   : "application/x-shockwave-flash"
          , ".t"     : "text/troff"
          , ".tar"   : "application/x-tar"
          , ".tbz"   : "application/x-bzip-compressed-tar"
          , ".tcl"   : "application/x-tcl"
          , ".tex"   : "application/x-tex"
          , ".texi"  : "application/x-texinfo"
          , ".texinfo" : "application/x-texinfo"
          , ".text"  : "text/plain"
          , ".tif"   : "image/tiff"
          , ".tiff"  : "image/tiff"
          , ".torrent" : "application/x-bittorrent"
          , ".tr"    : "text/troff"
          , ".txt"   : "text/plain"
          , ".vcf"   : "text/x-vcard"
          , ".vcs"   : "text/x-vcalendar"
          , ".vrml"  : "model/vrml"
          , ".war"   : "application/java-archive"
          , ".wav"   : "audio/x-wav"
          , ".wma"   : "audio/x-ms-wma"
          , ".wmv"   : "video/x-ms-wmv"
          , ".wmx"   : "video/x-ms-wmx"
          , ".wrl"   : "model/vrml"
          , ".wsdl"  : "application/wsdl+xml"
          , ".xbm"   : "image/x-xbitmap"
          , ".xhtml"   : "application/xhtml+xml"
          , ".xls"   : "application/vnd.ms-excel"
          , ".xml"   : "application/xml"
          , ".xpm"   : "image/x-xpixmap"
          , ".xsl"   : "application/xml"
          , ".xslt"  : "application/xslt+xml"
          , ".yaml"  : "text/yaml"
          , ".yml"   : "text/yaml"
          , ".zip"   : "application/zip"
          }
};