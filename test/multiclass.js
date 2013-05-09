var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('multiclass', function (t) {
    t.plan(6);
    
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
    
    tr.select('.three', function (node) {
        t.deepEqual(node.attributes, { 'class': 'three four' });
        node.html(function (html) {
            t.equal(html, 'yyy');
        });
    });
    
    tr.select('.one.three', function (node) {
        t.fail('should not have matched');
    });
    
    tr.select('.one.eleven', function (node) {
        t.fail('should not have matched');
    });
});
