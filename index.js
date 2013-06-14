var through = require('through');
var duplexer = require('duplexer');
var tokenize = require('./lib/tokenize.js');
var parseSelector = require('./lib/selector.js');
var matcher = require('./lib/matcher.js');

module.exports = function (opts) {
    var tokens = tokenize();
    var selectors = [];
    
    var dup = duplexer(tokens, tokens.pipe(through(function (lex) {
        selectors.forEach(function (s) {
            s._at(lex[0], lex[2]);
        });
        //this.queue(lex[0]);
        console.dir([ lex[0], lex[1] + '' ]);
    })));
    
    dup.select = function (sel) {
        var r = new Result(sel);
        selectors.push(r);
        return r;
    };
    return dup;
};

function Result (sel) {
    this._setAttr = {};
    this._matcher = matcher(parseSelector(sel));
}

Result.prototype._at = function (kind, x) {
    this._matcher.at(kind, x);
};

Result.prototype.setAttribute = function (key, value) {
    this._setAttr[key] = value;
    return this;
};

Result.prototype.createWriteStream = function () {
    // pipe data into this selector!
    // doesn't work with selectAll()
};

Result.prototype.createReadStream = function () {
    // pipe data FROM this selector!
    // doesn't work with selectAll()
};
