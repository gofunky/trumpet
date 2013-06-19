var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');

test('stream all divs', function (t) {
    t.plan(3);
    
    var html = [
        '\n<div class="b">\n<div class="c">\n</div>\n</div>\n',
        '\n<div class="c">\n</div>\n',
        '\n',
    ];
    
    var tr = trumpet();
    var divs = tr.selectAll('div');
    
    divs.on('readStream', function (stream) {
        stream.pipe(concat(function (src) {
            t.equal(src.toString(), html.shift());
        }));
    });
    
    fs.createReadStream(__dirname + '/overlapping_reads.html').pipe(tr);
});
