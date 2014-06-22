var trumpet = require('../');
var through = require('through2');
var test = require('tape');

test('immediate chunks', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var s = tr.select('b').createStream({ outer: true });
    s.pipe(through(function (buf, enc, next) {
        this.push(buf.toString('utf8').toUpperCase());
        next();
    })).pipe(s);
    
    tr.end('<b>beep boop</b>');
    
    var buf, chunks = [];
    while ((buf = tr.read()) !== null) {
        chunks.push(buf);
    }
    t.equal(Buffer.concat(chunks).toString('utf8'), '<B>BEEP BOOP</B>');
});
