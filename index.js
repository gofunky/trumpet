var sax = require('sax');
var through = require('through');
var duplexer = require('duplexer');
var buffers = require('buffers');

var EVENTS = [
    'opentag', 'attribute', 'opencdata', 'closecdata',
    'closetag', 'script', 'comment', 'text'
];

module.exports = function (opts) {
    var parser = sax.createStream(false);
    var bufs = buffers();
    var lexer = through(
        function (buf) {
            bufs.push(buf);
            return parser.write(buf);
        },
        function () { parser.end() }
    );
    var position = 0;
    
    EVENTS.forEach(function (evname) {
        parser.on(evname, function () {
            var buf = bufs.splice(0, parser._parser.position - position);
            position = parser._parser.position;
            
            lexer.queue([ evname, buf, arguments ]);
        });
    });
    
    return lexer;
};
