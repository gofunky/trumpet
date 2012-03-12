var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(5 - 2);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/selectors.html').pipe(tr);
    
    tr.select('* u', function (node) {
        t.equal(node.name, 'u');
        node.html(function (html) {
            t.equal(html, 'y');
        });
    });
    
    tr.select('.b > i', function (node) {
        node.html(function (html) {
            t.equal(html, 'burritos');
        });
    });
    
    tr.select('span > div', function (node) {
        t.fail('there are no divs inside spans');
    });
    
    /*
    tr.select('.b + .c', function (node) {
        node.html(function (html) {
            t.equal(html, 'C');
        });
    });
    
    tr.select('.y + .z', function (node) {
console.dir(node);
        node.html(function (html) {
            t.equal(html, 'Z');
        });
    });
    */
    
    tr.select('.b + .d', function (node) {
        t.fail('b is not an immediate sibling of d');
    });
});
