var trumpet = require('../');
var fs = require('fs');
var test = require('tape');
var concat = require('concat-stream');

test('read stream', function (t) {
    t.plan(1);
    
    var tr = trumpet();
    
    tr.select('.a').createReadStream().pipe(concat(function (body) {
        t.equal(body.toString(), 'AAA');
    }));
    
    fs.createReadStream(__dirname + '/read_stream.html').pipe(tr);
});
