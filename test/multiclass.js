var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('multiclass', function (t) {
    t.plan(4);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/multiclass.html').pipe(tr);
    
    tr.select('.one', function (node) {
        t.deepEqual(node.attributes, { 'class': 'one two' });
        node.html(function (html) {
            t.equal(html, 'xxx');
        });
    });
    
    tr.select('.one.two', function (node) {
        t.deepEqual(node.attributes, { 'class': 'one two' });
        node.html(function (html) {
            t.equal(html, 'xxx');
        });
    });
});
