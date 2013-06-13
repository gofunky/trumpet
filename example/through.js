var trumpet = require('../');
var through = require('through');

var tr = trumpet();
tr.pipe(through(function (lex) {
    console.dir([ lex[0], lex[1] + '' ]);
}));

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
