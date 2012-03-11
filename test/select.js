var test = require('tap').test;
var transit = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(5);
    
    var tr = transit();
    var spans = [ 'tacos', 'y', 'burritos' ];
    
    tr.select('b span', function (node) {
        t.equal(node.text, spans.shift());
    });
    
    var as = [ '¡¡¡', '!!!' ];
    tr.select('b span', function (node) {
        t.deepEqual(node.attributes, { class : 'a' });
        t.equal(node.text, as.shift());
    });
});
