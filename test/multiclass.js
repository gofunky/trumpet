var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('multiclass', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/multiclass.html').pipe(tr);
    
    tr.select('.one', function (node) {
        t.deepEqual(node.attributes, {});
        node.html(function (html) {
            t.equal(html, 'xxx');
        });
    });
});
