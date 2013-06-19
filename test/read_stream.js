var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');
var html = fs.readFileSync(__dirname + '/read_stream.html');

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

test('overlapping read streams', function (t) {
    t.plan(4);
    
    var tr = trumpet();
    var body = tr.select('body');
    body.createReadStream().pipe(concat(function (src) {
        var i = /<body>/.exec(html).index + 6;
        var j = /<\/body>/.exec(html).index;
        t.equal(src.toString(), html.slice(i, j).toString());
    }));
    
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

test('stream all divs', function (t) {
    t.plan(6);
    var html = [ 'AAA', 'X<b>Y</b>Z', 'CCC' ];
    var classes = [ 'a', 'b', 'c' ];
    
    var tr = trumpet();
    var divs = tr.selectAll('div');
    divs.getAttribute('class', function (c) {
        t.equal(c, classes.shift());
    });
    
    divs.on('readStream', function (stream) {
        stream.pipe(concat(function (src) {
            t.equal(src.toString(), html.shift());
        }));
    });
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});
