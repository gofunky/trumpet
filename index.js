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
                return attrs.push([ x, parser._parser.position ]);
            }
            
            var buf, len;
            
            if (evname === 'text') {
                len = x.length;
            }
            else {
                len = parser._parser.position - position;
            }
            
            buf = bufs.slice(0, len);
            bufs.splice(0, len);
            
            if (evname === 'opentag') {
                var m = /^<[^\s>]+\s*/.exec(buf.toString('utf8'));
                lexer.queue([ 'tag-begin', m && m[0] ]);
                var offset = m[0] && m[0].length || 0;
                
                attrs.forEach(function (attr) {
                    var abuf = buf.slice(offset, attr[1]);
                    var m = /^\s+/.exec(abuf.toString('utf8'));
                    
                    if (m) {
                        lexer.queue([ 'tag-space', m[0] ]);
                        lexer.queue([ 'attribute', abuf.slice(m[0].length) ]);
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
            
            position += len;
        });
    });
    
    return lexer;
};
