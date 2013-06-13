var trumpet = require('../');
var through = require('through');

var tr = trumpet();
tr.select('div').setAttribute('xyz', '123');

tr.pipe(process.stdout);

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
