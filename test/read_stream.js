const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const concat = require('concat-stream');
const html = fs.readFileSync(__dirname + '/read_stream.html');

test('outer stream', function (t) {
    t.plan(3);

    const tr = trumpet();

    tr.select('.a').createReadStream({ outer: true })
        .pipe(concat(function (body) {
            t.equal(body.toString(), '<div class="a">AAA</div>');
        }))
    ;

    const b = tr.select('.b');
    b.getAttribute('class', function (v) { t.equal(v, 'b') });
    b.createReadStream({ outer: true }).pipe(concat(function (body) {
        t.equal(body.toString(), '<div class="b">X<b>Y</b>Z</div>');
    }));
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});

test('read stream', function (t) {
    t.plan(3);

    const tr = trumpet();

    tr.select('.a').createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'AAA');
    }));

    const b = tr.select('.b');
    b.getAttribute('class', function (v) { t.equal(v, 'b') });
    b.createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'X<b>Y</b>Z');
    }));
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});

test('overlapping read streams', function (t) {
    t.plan(4);

    const tr = trumpet();
    const body = tr.select('body');
    body.createReadStream().pipe(concat(function (src) {
        const i = /<body>/.exec(html).index + 6;
        const j = /<\/body>/.exec(html).index;
        t.equal(src.toString(), html.slice(i, j).toString());
    }));
    
    tr.select('.a').createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'AAA');
    }));

    const b = tr.select('.b');
    b.getAttribute('class', function (v) { t.equal(v, 'b') });
    b.createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'X<b>Y</b>Z');
    }));
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});

test('stream all divs', function (t) {
    t.plan(9);
    const html = ['AAA', 'X<b>Y</b>Z', 'CCC'];
    const classes = ['a', 'b', 'c'];

    const tr = trumpet();
    tr.selectAll('div', function (div) {
        const c_ = classes.shift();
        t.equal(div.getAttribute('class'), c_);
        
        div.getAttribute('class', function (c) {
            t.equal(c, c_);
        });
        
        div.createReadStream().pipe(concat(function (src) {
            t.equal(src.toString(), html.shift());
        }));
    });
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});

test("end event when no match", function(t) {
    // Make sure an end event is emitted even with no "h1" element"
    const tr = trumpet();
    tr.createReadStream("h1").on("end", function() {
        t.end();
    });
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});
