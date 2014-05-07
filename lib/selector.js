var select = require('html-select');
var Writable = require('readable-stream').Writable;
var Readable = require('readable-stream').Readable;
var Duplex = require('readable-stream').Duplex;
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Selector, EventEmitter);
module.exports = Selector;

function Selector (str) {
    if (!(this instanceof Selector)) return new Selector(str);
    var self = this;
    this._select = select(str, function (tag) {
        if (self.reading) {
            var r = self.reading;
            self.reading = null;
            var opts = r._options;
            copyStream(tag.createReadStream(opts), r);
        }
        self._tag = tag;
        self.emit('match', tag);
    });
}

Selector.prototype._push = function (token) {
    this._select.write(token);
};

Selector.prototype.createWriteStream = function () {
    return new Writable;
};

Selector.prototype.createReadStream = function (opts) {
    var r = new Readable;
    r._read = function (n) {};
    r._options = opts;
    this.reading = r;
    return r;
};

Selector.prototype.createStream = function () {
    return new Duplex;
};

Selector.prototype.getAttribute = function (name, cb) {
    if (!this._tag) {
        this.on('match', function () {
            this.getAttribute(name, cb);
        });
        return;
    }
    if (cb) cb(this._tag.attributes[name]);
    return this._tag.attributes[name];
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
