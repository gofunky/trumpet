var trumpet = require('../');
var test = require('tap').test;
var concat = require('concat-stream');

test('attr plus inner updates', function (t) {
    t.plan(1);
    
    var html = '<div class="x"><div class="a"></div></div>';
    var tr = trumpet();
    tr.pipe(concat(function (src) {
        t.equal(src, '<div class="x y"><div class="a">AAA</div></div>');
    }));

    tr.select('.x', function (node) {
        node.update(String, { 'class': 'x y' });
    });

    tr.select('.a', function (node) {
        node.update('AAA');
    });
    
    tr.end(html);
});
