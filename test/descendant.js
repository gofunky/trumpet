const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const through = require('through');

test('descendant selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    const elem = tr.select('.a input[type=text]');
    elem.getAttribute('value', function (value) {
        t.equal(value, 'abc');
    });
    fs.createReadStream(__dirname + '/descendant.html').pipe(tr);
});

test('descendant no-match selector', function (t) {
    t.plan(1);

    const tr = trumpet();
    const elem = tr.select('.b .d');
    elem.getAttribute('class', function (value) {
        t.fail('should not have matched');
    });
    fs.createReadStream(__dirname + '/descendant.html').pipe(tr);
    
    tr.pipe(through(null, function () { t.ok(true) }));
});
