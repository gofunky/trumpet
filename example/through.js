var trumpet = require('../');
var through = require('through');

var tr = trumpet();
tr.pipe(through(function (lex) {
    console.dir(lex);
}));

var fs = require('fs');
fs.createReadStream(__dirname + '/select.html').pipe(tr);
