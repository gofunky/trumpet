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
    
    tokens.on('data', function () {});
    tokens.on('end', function () { console.log('END') });
    
    tokens.pipe(through(write, end));
    
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
    self._matcher = matcher(parseSelector(sel));
    self._matcher.on('open', function (node) {
        
    });
    self._matcher.on('attribute', function (node) {
        var f = self._getAttr[node.name];
        if (f) f(node.value);
        var v = self._setAttr[node.name];
        if (v !== undefined) self._substitute = v;
    });
}

Result.prototype._at = function (kind, x) {
    this._matcher.at(kind, x);
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
