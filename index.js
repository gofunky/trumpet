var sax = require('sax');
var through = require('through');
var buffers = require('buffers');
var duplexer = require('duplexer');
var createLexer = require('./lib/lexer.js');

var EVENTS = [
    'opentag', 'attribute', 'opencdata', 'closecdata',
    'closetag', 'script', 'comment', 'text'
];

module.exports = function (opts) {
    var lexer = createLexer();
    var dup = duplexer(lexer, lexer.pipe(through(function (lex) {
        this.queue(lex[1]);
        //console.dir([ lex[0], lex[1] + '' ]);
    })));
    
    dup.select = function () {
        return { setAttribute: function () {} };
    };
    return dup;
};
