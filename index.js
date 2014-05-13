var Transform = require('readable-stream').Transform;
var inherits = require('inherits');

var tokenize = require('html-tokenize');
var Selector = require('./lib/selector.js');
var applyAttr = require('./lib/apply_attr.js');

module.exports = Trumpet;
inherits(Trumpet, Transform);

function Trumpet () {
    if (!(this instanceof Trumpet)) return new Trumpet;
    Transform.call(this);
    this._tokenize = tokenize();
    this._selectors = [];
    this._after = [];
    this._writer = null;
    this._setAttr = null;
    
    this.once('finish', function () {
        this.push(null);
    });
}

Trumpet.prototype._transform = function (buf, enc, next) {
    var self = this;
    this._tokenize.write(buf);
    this._advance(next);
};

Trumpet.prototype._advance = function (next) {
    var self = this;
    var token;
    while ((token = this._tokenize.read()) !== null) {
        this._applyToken(token);
        if (this._writer && !this._duplexer) {
            this._next = next;
            return;
        }
    }
    next();
};

Trumpet.prototype._flush = function (next) {
    this._tokenize.end();
    this._advance(next);
};

Trumpet.prototype.selectAll = function (str, cb) {
    var self = this;
    var sel = new Selector(str);
    sel.on('match', onmatch);
    sel.on('writable', onwritable);
    sel.on('duplex', onduplex);
    
    sel._cleanup = function () {
        sel.removeListener('match', onmatch);
        sel.removeListener('writable', onwritable);
        sel.removeListener('duplex', onduplex);
        
        var ix = self._selectors.indexOf(sel);
        if (ix >= 0) self._selectors.splice(ix, 1);
    };
    
    function onmatch (tag) {
        self._tag = tag;
        if (cb) cb(tag);
        if (setAttr) self._setAttr = setAttr;
        setAttr = null;
        tag.once('close', function () {
            self._tag = null;
        });
    }
    
    function onwritable (w) {
        var finished = false;
        w.once('finish', function () { finished = true });
        
        if (self._tag) fromTag(self._tag)
        else sel.once('match', fromTag)
        
        function fromTag (tag, already) {
            self._writer = w;
            if (w._options.outer) {
                self._skip = true;
                w._copy(self);
            }
            else {
                self._after.push(function () { w._copy(self) });
            }
            if (finished) self._after.push(onfinish)
            else w.once('finish', onfinish)
            
            function onfinish () {
                self._writer = null;
                self._skip = true;
                if (self._next) self._advance(self._next);
            }
            tag.once('close', function () {
                if (w._options.outer) {
                    self._after.push(function () { self._skip = false });
                }
                else self._skip = false;
            });
        }
    }
    
    function onduplex (d) {
        var finished = false;
        d.once('finish', function () { finished = true });
        
        if (self._tag) fromTag(self._tag)
        else sel.once('match', fromTag)
        
        function fromTag (tag) {
            self._duplexer = d;
            if (!d._options.outer) {
                self._after.push(function () { self._skip = true });
            }
            
            if (finished) self._after.push(onfinish);
            else d.on('finish', onfinish);
            
            function onfinish () {
                self._duplexer = null;
                self._skip = false;
            }
        }
        onwritable(d._writer);
    }
    
    var setAttr;
    sel.on('_setAttr', function (name, value) {
        if (!setAttr) setAttr = {};
        setAttr[name] = value;
    });
    
    this._selectors.push(sel);
    return sel;
};

Trumpet.prototype.select = function (str, cb) {
    var self = this;
    var sel = self.selectAll(str, cb);
    sel.once('match', function (tag) {
        tag.once('close', function () {
            sel._cleanup();
        });
    });
    return sel;
};

Trumpet.prototype._applyToken = function (token) {
    for (var i = 0; i < this._selectors.length; i++) {
        var sel = this._selectors[i];
        sel._push(token);
    }
    if (!this._skip && this._setAttr) {
        var buf = applyAttr(this._setAttr, this._tag, token[1]);
        this._setAttr = null;
        this.push(buf);
    }
    else if (!this._skip) this.push(token[1]);
    while (this._after.length) this._after.shift()();
};

Trumpet.prototype.createReadStream = function (sel, opts) {
    return this.select(sel).createReadStream(opts);
};

Trumpet.prototype.createWriteStream = function (sel, opts) {
    return this.select(sel).createWriteStream(opts);
};
