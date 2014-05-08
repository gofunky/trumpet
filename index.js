var Transform = require('readable-stream').Transform;
var inherits = require('inherits');

var tokenize = require('html-tokenize');
var Selector = require('./lib/selector.js');

module.exports = Trumpet;
inherits(Trumpet, Transform);

function Trumpet () {
    if (!(this instanceof Trumpet)) return new Trumpet;
    Transform.call(this);
    this._tokenize = tokenize();
    this._selectors = [];
}

Trumpet.prototype._transform = function (buf, enc, next) {
    var self = this;
    this._tokenize.write(buf);
    
    var token;
    while ((token = self._tokenize.read()) !== null) {
        self._applyToken(token);
    }
    next();
};

Trumpet.prototype._flush = function (next) {
    this._tokenize.end();
    this.push(null);
    next();
};

Trumpet.prototype.select = function (str) {
    var self = this;
    var sel = new Selector(str);
    sel.once('match', function (tag) {
        tag.once('close', function () {
            var ix = self._selectors.indexOf(tag);
            if (ix >= 0) self._selectors.splice(ix, 1);
        });
    });
    this._selectors.push(sel);
    return sel;
};

Trumpet.prototype.selectAll = function (str, cb) {
    var self = this;
    var sel = new Selector(str);
    sel.on('match', function (tag) {
        cb(tag);
    });
    this._selectors.push(sel);
    return sel;
};

Trumpet.prototype._applyToken = function (token) {
    for (var i = 0; i < this._selectors.length; i++) {
        var sel = this._selectors[i];
        sel._push(token);
    }
    this.push(token[1]);
};

Trumpet.prototype.createReadStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};

Trumpet.prototype.createWriteStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};
