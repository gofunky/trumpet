var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');

test('img src', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    fs.createReadStream(__dirname + '/img.html').pipe(tr);
    
    tr.select('img', function (node) {
        node.update(String, { src: '/robot.png' });
    });
    
    var data = '';
    tr.on('data', function (buf) { data += buf });
    tr.on('end', function () {
        t.equal(data, '<img src="/robot.png">\n');
    });
});
