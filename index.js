var through = require('through');
var tokenize = require('./lib/tokenize.js');
var parseSelector = require('./lib/selector.js');
var matcher = require('./lib/matcher.js');
var ent = require('ent');

module.exports = function (opts) {
    var selectors = [];
    var tokens = tokenize();
    tokens.pipe(through(write, end));
    
    var tr = through(
        function (buf) { tokens.write(buf) },
        function () { tokens.end() }
    );
    
    tr.select = function (sel) {
        var r = new Result(sel);
        selectors.push(r);
        return r;
    };
    return tr;
    
    function write (lex) {
        var sub;
        selectors.forEach(function (s) {
            s._at(lex[0], lex[2]);
            if (s._substitute !== undefined) {
                sub = s._substitute;
                s._substitute = undefined;
            }
        });
        
        if (sub !== undefined) tr.queue(sub)
        else tr.queue(lex[1])
    }
    
    function end () {
        tr.queue(null);
    }
};

function Result (sel) {
    var self = this;
    self._setAttr = {};
    self._getAttr = {};
    self._matchers = [ matcher(parseSelector(sel)) ];
    
    self._matchers[0].on('fork', onfork);
    self._matchers[0].on('attribute', onattribute);
    
    function onfork (matcher) {
        matcher.on('attribute', onattribute);
        matcher.on('fork', onfork);
        matcher.on('leave', function () {
            var ix = self._matchers.indexOf(matcher);
            if (ix >= 0) self._matchers.splice(ix, 1);
        });
        self._matchers.push(matcher);
    }
    
    function onattribute (node) {
        var f = self._getAttr[node.name];
        if (f) f(node.value);
        var v = self._setAttr[node.name];
        if (v !== undefined) self._substitute = v;
    }
}

Result.prototype._at = function (kind, x) {
    for (var i = 0; i < this._matchers.length; i++) {
        this._matchers[i].at(kind, x);
    }
};

Result.prototype.setAttribute = function (key, value) {
    var sub = Buffer(ent.encode(key) + '="' + ent.encode(value) + '"');
    this._setAttr[key.toUpperCase()] = sub;
    return this;
};

Result.prototype.getAttribute = function (key, cb) {
    this._getAttr[key.toUpperCase()] = cb;
};

Result.prototype.createWriteStream = function () {
    // pipe data into this selector!
    // doesn't work with selectAll()
};

Result.prototype.createReadStream = function () {
    // pipe data FROM this selector!
    // doesn't work with selectAll()
};
