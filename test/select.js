var test = require('tap').test;
var transit = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(6 + 4);
    
    var tr = transit();
    fs.createReadStream(__dirname + '/select.html').pipe(tr);
    
    var spans = [ 'tacos', 'y', 'burritos' ];
    
    tr.select('.b span', function (node) {
        t.deepEqual(node.attributes, {});
        node.text(function (text) {
            t.equal(text, spans.shift());
        });
    });
    
    var as = [ '¡¡¡', '!!!' ];
    tr.select('.a', function (node) {
        t.deepEqual(node.attributes, { class : 'a' });
        node.text(function (text) {
            t.equal(text, as.shift());
        });
    });
});
