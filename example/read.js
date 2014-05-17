var trumpet = require('../');
var tr = trumpet();

tr.select('.msg', function (e) {
    e.createReadStream().pipe(process.stdout);
});

var fs = require('fs');
fs.createReadStream(__dirname + '/html/read.html').pipe(tr);
tr.resume();
