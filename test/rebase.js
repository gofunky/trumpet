const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const through = require('through');

test('wonky duplicated classes selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    const elem = tr.select('.c');
    elem.getAttribute('class', function (value) {
        t.equal(value, 'c');
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});

test('rebase selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    const elem = tr.select('.a > .b > * > .d');
    elem.getAttribute('class', function (value) {
        t.equal(value, 'd');
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});

test('too many ancestors selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.pipe(through(null, function () { t.ok(true) }));

    const elem = tr.select('.a > .b > * > * > .d');
    elem.getAttribute('class', function (value) {
        t.fail('should not have matched');
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});

test('get all class names', function (t) {
    t.plan(6);
    const names = ['a', 'b', 'a', 'b', 'c', 'd'];

    const tr = trumpet();

    tr.selectAll('div', function (elem) {
        elem.getAttribute('class', function (value) {
            t.equal(value, names.shift());
        });
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});

test('all class name pairs', function (t) {
    t.plan(1);
    const tr = trumpet();
    const names = [];
    tr.pipe(through(null, function () {
        t.deepEqual(names, [ 'b', 'a', 'b', 'c', 'd' ]);
    }));
    
    tr.selectAll('div > div', function (elem) {
        elem.getAttribute('class', function (value) {
            names.push(value);
        });
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});
