const trumpet = require('../');
const fs = require('fs');
const through = require('through');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('outer through stream', function (t) {
    t.plan(1);

    const tr = trumpet();
    const ts = tr.select('div').createStream({outer: true});
    ts.pipe(through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    })).pipe(ts);
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<html><body><DIV>XYZ</DIV></body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/through_stream.html').pipe(tr);
});

test('through stream', function (t) {
    t.plan(1);

    const tr = trumpet();
    const ts = tr.select('div').createStream();
    ts.pipe(through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    })).pipe(ts);
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<html><body><div>XYZ</div></body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/through_stream.html').pipe(tr);
});
