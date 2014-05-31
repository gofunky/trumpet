var Readable = require('readable-stream').Readable;
var Writable = require('readable-stream').Writable;
var Duplex = require('readable-stream').Duplex;
var inherits = require('inherits');
var through = require('through2');

var tokenize = require('html-tokenize');
var select = require('html-select');
var parseTag = require('html-select/lib/parse_tag.js');

module.exports = Trumpet;
inherits(Trumpet, Duplex);

function Trumpet () {
    var self = this;
    if (!(this instanceof Trumpet)) return new Trumpet;
    Duplex.call(this);
    this._tokenize = tokenize();
    this._writing = false;
    this._piping = false;
    this._select = this._tokenize.pipe(select());
}

Trumpet.prototype.pipe = function () {
    this._piping = true;
    return Duplex.prototype.pipe.apply(this, arguments);
};

Trumpet.prototype._read = function (n) {
    var self = this;
    var buf, read = 0;
    var s = this._select;
    while ((row = s.read()) !== null) {
        this.push(row[1]);
        read ++;
    }
    if (read === 0) s.once('readable', function () { self._read(n) });
};

Trumpet.prototype._write = function (buf, enc, next) {
    if (!this._writing && !this._piping) {
        this._piping = true;
        this.resume();
    }
    return this._tokenize._write(buf, enc, next);
};

Trumpet.prototype.select = function (str, cb) {
    var self = this;
    var first = true;
    
    var res = self._selectAll(str, function (elem) {
        if (!first) return;
        first = false;
        res.createReadStream = function () {};
        res.createWriteStream = function () {};
        res.createStream = function () {};
        if (cb) cb(elem);
    });
    return res;
};

Trumpet.prototype.selectAll = function (str, cb) {
    return this._selectAll(str, cb);
};

Trumpet.prototype._selectAll = function (str, cb) {
    var self = this;
    var readers = [], writers = [];
    var gets = [];
    
    var element, welem;
    this._select.select(str, function (elem) {
        element = elem;
        welem = wrapElem(elem);
        if (cb) cb(welem);
        
        elem.once('close', function () {
            element = null;
            welem = null;
        });
        
        readers.splice(0).forEach(function (r) {
            welem.createReadStream(r._options).pipe(r);
        });
        
        writers.splice(0).forEach(function (w) {
            w.pipe(welem.createWriteStream(w._options));
        });
        
        gets.splice(0).forEach(function (g) {
            welem.getAttribute(g[0], g[1]);
        });
    });
    
    return {
        getAttribute: function (key, cb) {
            if (welem) return welem.getAttribute(key, cb);
            gets.push([ key, cb ]);
        },
        createReadStream: function (opts) {
            if (welem) return welem.createReadStream(opts);
            var r = through();
            r._options = opts;
            readers.push(r);
            return r;
        },
        createWriteStream: function (opts) {
            if (welem) return welem.createWriteStream(opts);
            var w = through();
            w._options = opts;
            writers.push(w);
            return w;
        }
    };
};

function wrapElem (elem) {
    var tag;
    var first = elem._first;
    function getTag () {
        if (tag) return tag;
        tag = parseTag(first[1]);
        return tag;
    }
    
    return {
        getAttribute: function (key, cb) {
            var value = getTag().getAttributes()[key];
            if (cb) cb(value);
            return value;
        },
        createReadStream: function (opts) {
            if (!opts) opts = {};
            return elem.createReadStream({ inner: !opts.outer })
                .pipe(through.obj(write, end));
            ;
            function write (row, enc, next) { this.push(row[1]); next() }
            function end (next) { this.push(null); next() }
        },
        createWriteStream: function (opts) {
            if (!opts) opts = {};
            var we = elem.createWriteStream({ inner: !opts.outer });
            var ws = new Writable;
            ws._write = function (buf, enc, next) { we.write(buf); next() };
            ws.once('finish', function () { we.end() });
            return ws;
        },
        createStream: function (opts) {
            if (!opts) opts = {};
            return elem.createStream({ inner: !opts.outer });
        }
    }
    
}
    
Trumpet.prototype.createReadStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};

Trumpet.prototype.createWriteStream = function (sel, opts) {
    return this.select(sel).createWriteStream(opts);
};
