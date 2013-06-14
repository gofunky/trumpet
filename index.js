var sax = require('sax');
var through = require('through');
var buffers = require('buffers');
var duplexer = require('duplexer');
var tokenize = require('./lib/tokenize.js');
var parseSelector = require('./lib/selector.js');

var EVENTS = [
    'opentag', 'attribute', 'opencdata', 'closecdata',
    'closetag', 'script', 'comment', 'text'
];

module.exports = function (opts) {
    var tokens = tokenize();
    var selectors = [];
    
    var dup = duplexer(tokens, tokens.pipe(through(function (lex) {
        this.queue(lex[1]);
        //console.dir([ lex[0], lex[1] + '' ]);
    })));
    
    dup.select = function (s) {
        var sel = parseSelector(s);
        console.dir(sel[0].attribute);
        selectors.push(sel);
        return new Result;
    };
    return dup;
};

function Result () {
}

Result.prototype.setAttribute = function (key, value) {
};
