const trumpet = require('../');
const fs = require('fs');
const through = require('through');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('outer write stream', function (t) {
    t.plan(1);

    const tr = trumpet();
    const ws = tr.select('div').createWriteStream({outer: true});
    const s = through();
    s.pipe(ws);
    
    s.write('<B>beep');
    
    setTimeout(function () {
        s.write(' boop.</B>');
        s.end();
    }, 500);
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<!doctype html>'
            + '<html><body> <B>beep boop.</B></body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/write_stream.html').pipe(tr);
});

test('write stream', function (t) {
    t.plan(1);

    const tr = trumpet();
    const ws = tr.select('div').createWriteStream();
    const s = through();
    s.pipe(ws);
    
    s.write('beep');
    
    setTimeout(function () {
        s.write(' boop.');
        s.end();
    }, 500);
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<!doctype html>'
            + '<html><body><div class="x">beep boop.</div>'
            + '</body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/write_stream.html').pipe(tr);
});
