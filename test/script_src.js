var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('script src', function (t) {
    t.plan(6);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/script_src.html').pipe(tr);
    
    tr.select('script', function (node) {
        t.equal(node.attributes.type, 'text/javascript');
        node.html(function (src) {
            t.equal(src, 'console.log(i<j)');
        });
    });

    tr.select('title', function (node) {
        t.equal(node.name, 'title');
        node.html(function (html) {
            t.equal(html, 'beep');
        });
    });

    tr.select('.c', function (node) {
        t.equal(node.name, 'div');
        node.html(function (html) {
            t.equal(html, 'boop');
        });
    });
});
