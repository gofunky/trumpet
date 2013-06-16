var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var through = require('through');

test('wonky duplicated classes selector', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var elem = tr.select('.c');
    elem.getAttribute('class', function (value) {
        t.equal(value, 'c');
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});

test('rebase selector', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var elem = tr.select('.a > .b > * > .d');
    elem.getAttribute('class', function (value) {
        t.equal(value, 'd');
    });
    fs.createReadStream(__dirname + '/rebase.html').pipe(tr);
});
