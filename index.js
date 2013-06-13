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
    var attrs = [];
    
    EVENTS.forEach(function (evname) {
        parser.on(evname, function (x) {
            if (evname === 'attribute') {
                var pos = parser._parser.position
                    - parser._parser.startTagPosition + 1
                ;
                return attrs.push([ x, pos ]);
            }
            
            var buf, len, posLen;
            
            if (evname === 'text') {
                len = Buffer(x).length;
                posLen = x.length;
            }
            else {
                len = parser._parser.position - position;
                posLen = len;
            }
            
            buf = bufs.slice(0, len);
            bufs.splice(0, len);
            
            if (evname === 'opentag') {
                for (var offset = 0; offset < buf.length; offset++) {
                    if (/[\s>]/.test(String.fromCharCode(buf[offset]))) break;
                }
                
                lexer.queue([ 'tag-begin', buf.slice(0, offset) ]);
                
                attrs.forEach(function (attr) {
                    var abuf = buf.slice(offset, attr[1]);
                    for (var ix = 0; ix < abuf.length; ix++) {
                        if (/\S/.test(String.fromCharCode(abuf[ix]))) break;
                    }
                    
                    if (ix) {
                        lexer.queue([ 'tag-space', abuf.slice(0, ix) ]);
                        lexer.queue([ 'attribute', abuf.slice(ix) ]);
                    }
                    else {
                        lexer.queue([ 'attribute', abuf ]);
                    }
                    offset = attr[1];
                });
                
                lexer.queue([ 'tag-end', buf.slice(offset) ]);
                attrs = [];
            }
            else lexer.queue([ evname, buf ]);
            
            position += posLen;
        });
    });
    
    return lexer;
};
