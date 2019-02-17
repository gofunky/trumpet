const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const through = require('through');

test('child selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    const elem = tr.select('.c > input[type=text]');
    elem.getAttribute('value', function (value) {
        t.equal(value, 'abc');
    });
    fs.createReadStream(__dirname + '/child.html').pipe(tr);
});

test('child no-match selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.pipe(through(null, function () {
        t.ok(true);
    }));
    const elem = tr.select('.b > input[type=text]');
    elem.getAttribute('value', function (value) {
        t.fail('should not have matched');
    });
    fs.createReadStream(__dirname + '/child.html').pipe(tr);
});

test('child start then no match selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.pipe(through(null, function () {
        t.ok(true);
    }));
    const elem = tr.select('.b > .d');
    elem.getAttribute('class', function (value) {
        t.fail('should not have matched');
    });
    fs.createReadStream(__dirname + '/child.html').pipe(tr);
});

test('child with similar grandchild selector', function (t) {
    t.plan(2);

    const tr = trumpet();
    tr.selectAll('.a > div', function (elem) {
        elem.getAttribute('class', function (value) {
            t.notEqual(value, 'c', 'should not have matched');
        });
    });
    fs.createReadStream(__dirname + '/child.html').pipe(tr);
});
