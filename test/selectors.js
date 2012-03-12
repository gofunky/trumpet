var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('select', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/selectors.html').pipe(tr);
    
    /*
    tr.select('* u', function (node) {
        t.equal(node.name, 'b');
        node.html(function (html) {
            t.equal('<u>y</u>');
        });
    });
    */
    
    tr.select('.b > i', function (node) {
        node.html(function (html) {
            t.equal(html, 'burritos');
        });
    });
    
    tr.select('span > div', function (node) {
        t.fail('there are no divs inside spans');
    });
});
