var fs = require("fs");
var path = require("path");

var contentWorker = function(options) {
    this.path = options && options.path ? options.path : "./";
    this.filename = options && options.filename ? options.filename : function() { return Date.now(); };
    this.ext = options && options.ext ? options.ext : "";
    if (!fs.existsSync(this.path)) fs.mkdirSync(this.path);
    this.writable = true;
};

require('util').inherits(contentWorker, require('stream'));

contentWorker.prototype.write = function(data) {
    var filename = path.join(this.path, this.filename() + this.ext);
    fs.writeFile(filename, data, function(err) { if (err) throw new Error(err); });
};

contentWorker.prototype.end = function(chunk) {
    this.writable = false;
};

contentWorker.prototype.destroy = function() {
    this.writable = false;
};

module.exports = contentWorker;