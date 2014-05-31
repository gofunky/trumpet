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
    this._selectors = [];
}

Trumpet.prototype.pipe = function () {
    this._piping = true;
    return Duplex.prototype.pipe.apply(this, arguments);
};

Trumpet.prototype._read = function (n) {
    var self = this;
    var buf;
    for (var i = 0; i < this._selectors.length; i++) {
        var s = this._selectors[i];
        var read = 0;
        while ((row = s.read()) !== null) {
            this.push(row[1]);
            read ++;
        }
        if (read === 0) s.once('readable', function () { self._read(n) });
    }
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
    var readers = [], gets = [];
    
    var s = select();
    this._selectors.push(s);
    this._tokenize.pipe(s);
    
    var element, welem;
    s.select(str, function (elem) {
        element = elem;
        welem = wrapElem(elem);
        if (cb) cb(welem);
        
        elem.once('close', function () {
            element = null;
            welem = null;
        });
        
        readers.splice(0).forEach(function (r) {
            var re = welem.createReadStream(r._options);
            re.pipe(through.obj(write, end));
            
            function write (row, enc, next) {
                r.push(row[1]);
                next();
            }
            function end (next) {
                r.push(null);
                next();
            }
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
            
            var r = new Readable;
            r._read = function () {};
            r._options = opts;
            readers.push(r);
            return r;
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
            return elem.createReadStream({ inner: !opts.outer });
        }
    }
    
}
    
Trumpet.prototype.createReadStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};

Trumpet.prototype.createWriteStream = function (sel, opts) {
    return this.select(sel).createWriteStream(opts);
};
