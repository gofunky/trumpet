var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');

test('read stream', function (t) {
    t.plan(3);
    
    var tr = trumpet();
    
    tr.select('.a').createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'AAA');
    }));
    
    var b = tr.select('.b');
    b.getAttribute('class', function (v) { t.equal(v, 'b') });
    b.createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'X<b>Y</b>Z');
    }));
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});
