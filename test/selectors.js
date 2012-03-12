var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/select.html').pipe(tr);
    
    tr.select('.b * u', function (node) {
        t.fail('* should only go 1 level');
    });
    
    tr.select('.b > i', function (node) {
        node.html(function (html) {
            t.equal(html, 'burritos');
        });
    });
});
