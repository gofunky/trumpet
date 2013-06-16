var trumpet = require('../');
var fs = require('fs');
var test = require('tape');

test('get attribute', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    var elem = tr.select('.b input[type=text]');
    elem.getAttribute('value', function (value) {
        t.equal(value, '¡¡¡');
    });
    fs.createReadStream(__dirname + '/get_attr.html').pipe(tr);
});
