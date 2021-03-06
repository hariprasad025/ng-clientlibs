const cmd = require('command-line-args');
const fs = require('fs');
const cheerio = require('cheerio');
const optionDefinitions = [
  { name: 'src', type: String}
]
const options = cmd(optionDefinitions)

var _readFiles = function(dirname, onError) {
  var appDirName = dirname + "/app";
  var indexfile = appDirName + "/index.html";
  fs.readFile(indexfile, 'utf8', function read(err, data) {
		if (err) {
			onError(err);
		}
		content = data;
		console.log(content);   
		var filenames = _processFile(dirname,content);          
	});
  
  /*fs.readdir(appDirName, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
	_updateJsTxt(dirname,filenames);
	_updateCssTxt(dirname,filenames);	
  }); */
}

var _processFile = function(dirname,content){
	var $ = cheerio.load(content);

    var linkHrefs = $('link').map(function(i) {
      return $(this).attr('href');
    }).get();
	_updateCssTxt(dirname,linkHrefs);	
	
    var scriptSrcs = $('script').map(function(i) {
      return $(this).attr('src');
    }).get();
	_updateJsTxt(dirname,scriptSrcs);
}

var _updateJsTxt = function(dirname,filenames){
	var stream = fs.createWriteStream(dirname + "/js.txt");
		stream.once('open', function(fd) {
			stream.write("#base=app\r\n");
			filenames.forEach(function(filename) {
				console.log("js : ", filename);
				if(endsWith(filename, '.js')){
					stream.write(filename + "\r\n");
				}
			});
		stream.end();
	});
}

var _updateCssTxt = function(dirname,filenames){
	var stream = fs.createWriteStream(dirname + "/css.txt");
		stream.write("#base=app\r\n");
		stream.once('open', function(fd) {
			filenames.forEach(function(filename) {
				console.log("css : ", filename);
				if(endsWith(filename, '.css')){
					stream.write(filename + "\r\n");
				}
			});
		stream.end();
	});
}

var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var onError = function(err){
	console.log("error reading file inside directory");
}

var _print = function() {
    console.log("root folder : ", options.src);
	_readFiles(options.src,onError);
};

_print();
module.exports = {
  print: _print
}
