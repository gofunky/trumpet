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
        self._tag = wrap(tag);
        self.emit('match', tag);
    });
}

Selector.prototype._push = function (token) {
    this._select.write(token);
};

Selector.prototype.createWriteStream = function () {
    var w = new Writable;
    w._copy = function (dst) {
        w._write = function (buf, enc, next) {
            dst.push(buf);
            next();
        };
        if (w._buffer) {
            dst.push(w._buffer);
            w._buffer = null;
            w._next();
        }
    };
    
    w._write = function (buf, enc, next) {
        w._buffer = buf;
        w._next = next;
    };
    
    this._writer = w;
    this.emit('writable', w);
    return w;
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
    var self = this;
    if (!this._tag) {
        this._select.once('match', function () {
            self.getAttribute(name, cb);
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

function wrap (tag) {
    tag.getAttribute = function (name, cb) {
        var key = String(name).toLowerCase();
        if (cb) cb(tag.attributes[key]);
        return tag.attributes[key];
    };
    return tag;
}
