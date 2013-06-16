var trumpet = require('../');
var fs = require('fs');
var test = require('tape');

test('descendant selector', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var elem = tr.select('.a input[type=text]');
    elem.getAttribute('value', function (value) {
        t.equal(value, 'abc');
    });
    fs.createReadStream(__dirname + '/descendant.html').pipe(tr);
});
