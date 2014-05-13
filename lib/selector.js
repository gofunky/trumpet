var select = require('html-select');
var Writable = require('readable-stream').Writable;
var Readable = require('readable-stream').Readable;
var duplexer = require('duplexer2');
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
        self._tag = self._wrap(tag);
        self.emit('match', self._tag);
    });
}

Selector.prototype._push = function (token) {
    this._select.write(token);
};

Selector.prototype._createWriteStream = function (opts) {
    var w = new Writable;
    w._options = opts || {};
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
    w._selector = this;
    
    this._writer = w;
    return w;
};

Selector.prototype.createWriteStream = function (opts) {
    var w = this._createWriteStream(opts);
    this.emit('writable', w);
    return w;
};

Selector.prototype._createReadStream = function (opts) {
    var r = new Readable;
    r._read = function (n) {};
    r._options = opts;
    r._selector = this;
    this.reading = r;
    return r;
};

Selector.prototype.createReadStream = function (opts) {
    var r = this._createReadStream();
    this.emit('readable', r);
    return r;
};

Selector.prototype.createStream = function (opts) {
    var r = this._createReadStream(opts);
    var w = this._createWriteStream(opts);
    var d = duplexer(w, r);
    this.emit('duplex', d);
    return d;
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

Selector.prototype.setAttribute = function (name, value) {
    this.emit('_setAttr', name.toLowerCase(), value);
};

Selector.prototype.removeAttribute = function (name) {
    this.emit('_setAttr', name.toLowerCase(), undefined);
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

Selector.prototype._wrap = function (tag) {
    var self = this;
    tag.getAttribute = function (name, cb) {
        var key = String(name).toLowerCase();
        if (cb) cb(tag.attributes[key]);
        return tag.attributes[key];
    };
    tag.setAttribute = function (name, value) {
        return self.setAttribute(name, value);
    };
    tag.createReadStream = function (opts) {
        return self.createReadStream(opts);
    };
    tag.createWriteStream = function (opts) {
        return self.createWriteStream(opts);
    };
    tag.createStream = function (opts) {
        return self.createStream(opts);
    };
    return tag;
};
