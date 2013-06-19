var trumpet = require('../');
var fs = require('fs');
var through = require('through');
var test = require('tape');
var concat = require('concat-stream');

test('write stream', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var ws = tr.select('div').createWriteStream();
    var s = through();
    s.pipe(ws);
    
    s.write('beep');
    
    setTimeout(function () {
        s.write(' boop.');
        s.end();
    }, 500);
    
    tr.pipe(concat(function (body) {
        t.equal(
            body.toString(),
            '<html>\n<body>\n<div>beep boop.</div>\n</body>\n</html>\n'
        );
    }));
    
    fs.createReadStream(__dirname + '/write_stream.html').pipe(tr);
});
