var test = require('tap').test;
var transit = require('../');

var fs = require('fs');

test(function (t) {
    t.plan(1);
    
    var html = fs.readFileSync(__dirname + '/ex.html', 'utf8');
    
    var tr = transit(function (node) {
        if (node.type === 'open' || node.type === 'close') {
            node.write('(' + node.source.slice(1, -1) + ')');
        }
        else {
            node.write(node.source);
        }
    });
    fs.createReadStream(__dirname + '/ex.html').pipe(tr);
    
    var data = '';
    tr.on('data', function (buf) { data += buf });
    tr.on('end', function () {
        var ref = html.replace(/</g, '(').replace(/>/g, ')');
        t.equal(data, ref);
        t.end();
    });
});
