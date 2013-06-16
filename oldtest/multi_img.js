var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('multi img src', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/multi_img.html').pipe(tr);
    
    tr.select('.a .b', function (node) {
        var attr = node.attributes;
        attr.src = '/bbb.png';
        node.update(String, attr);
    });
    
    tr.select('.a .c', function (node) {
        var attr = node.attributes;
        attr.src = '/ccc.png';
        node.update(String, attr);
    });
    
    var data = '';
    tr.on('data', function (buf) { data += buf });
    tr.on('end', function () {
        t.equal(data, [
            '<div class="a">',
                '  <img class="b" src="/bbb.png">',
                '  <img class="c" src="/ccc.png">',
            '</div>',
            ''
        ].join('\n'));
    });
});
