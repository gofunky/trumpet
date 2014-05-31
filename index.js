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
    var buf, read = 0;
    for (var i = 0; i < this._selectors.length; i++) {
        var s = this._selectors[i];
        while ((row = s.read()) !== null) {
            this.push(row[1]);
            read ++;
        }
    }
    if (read === 0) s.once('readable', function () { self._read(n) });;
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
    var readers = [];
    
    var s = select();
    this._selectors.push(s);
    this._tokenize.pipe(s);
    
    var element;
    s.select(str, function (elem) {
        element = elem;
        readers.splice(0).forEach(function (r) {
            var re = elem.createReadStream(r._options);
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
    });
    
    return {
        createReadStream: function (opts) {
            var r = new Readable;
            r._read = function () {};
            r._options = opts || {};
            r._options.inner = !r._options.outer;
            readers.push(r);
            return r;
        }
    };
};

Trumpet.prototype._augment = function (elem, cb) {
    return cb({
        createReadStream: function (opts) {
            var re = elem.createReadStream(opts);
            var rs = new Readable;
            rs._read = function () {};
            re.pipe(through.obj(write, end));
            return rs;
            
            function write (row, enc, next) {
                rs.push(row[1]);
                next();
            }
            function end (next) {
                rs.push(null);
                next();
            }
        }
    });
};

Trumpet.prototype.createReadStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};

Trumpet.prototype.createWriteStream = function (sel, opts) {
    return this.select(sel).createWriteStream(opts);
};
