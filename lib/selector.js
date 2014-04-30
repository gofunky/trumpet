var select = require('html-select');
var Writable = require('readable-stream').Writable;
var Readable = require('readable-stream').Readable;
var Duplex = require('readable-stream').Duplex;

module.exports = Selector;

function Selector (str) {
    if (!(this instanceof Selector)) return new Selector(str);
    var self = this;
    this._select = select(str, function (tag) {
        if (self.reading) {
            copyStream(tag, self.reading);
        }
    });
}

Selector.prototype._push = function (token) {
    this._select.write(token);
};

Selector.prototype.createWriteStream = function () {
    return new Writable;
};

Selector.prototype.createReadStream = function (opts) {
    if (!opts) opts = {};
    var r = new Readable;
    r._read = function (n) {};
    this.reading = r;
    return r;
};

Selector.prototype.createStream = function () {
    return new Duplex;
};

Selector.prototype.getAttribute = function () {
};

Selector.prototype.setAttribute = function () {
};

Selector.prototype.removeAttribute = function () {
};

function copyStream (a, b) {
    a.on('end', function () { b.push(null) });
    (function read () {
        var buf;
        while ((buf = a.read()) !== null) {
            b.push(buf);
        }
        a.once('readable', read);
    })();
}
