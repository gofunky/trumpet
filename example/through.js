var trumpet = require('../');
var through = require('through');

var tr = trumpet();
tr.pipe(process.stdout);

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
