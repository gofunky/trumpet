var test = require('tap').test;
var transit = require('../');
var fs = require('fs');

test('update', function (t) {
    var html = fs.readFileSync(__dirname + '/update_target.html', 'utf8');
    
    var tr = transit();
    fs.createReadStream(__dirname + '/update.html').pipe(tr);
    
    var spans = [ 'tacos', 'y', 'burritos' ];
    
    tr.select('.b span', function (node) {
        node.update(function (html) {
            return html.toUpperCase();
        });
    });
    
    tr.select('.c', function (node) {
        node.update('---');
    });
    
    tr.select('.d', function (node) {
        node.remove();
    });
    
    var data = '';
    tr.on('data', function (buf) { data += buf });
    
    tr.on('end', function () {
        t.equal(data, html);
        t.end();
    });
});
