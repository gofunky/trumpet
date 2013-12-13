var trumpet = require('../');
var fs = require('fs');
var through = require('through');
var test = require('tape');
var concat = require('concat-stream');

test('overlap prepend stream', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var s = tr.select('script').createStream({ outer: true });
    s.write('!!!!!\n');
    s.pipe(through()).pipe(s);
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<html>\n<body>\n!!!!!\n'
            + '<script src="/a.js"></script>\n</body>\n</html>\n'
        );
    }));
    fs.createReadStream(__dirname + '/overlap_stream.html').pipe(tr);
});
