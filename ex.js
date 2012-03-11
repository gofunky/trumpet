var transit = require('./');
var tr = transit(function (elem, emit) {
    emit();
});
tr.pipe(process.stdout, { end : false });

var fs = require('fs');
fs.createReadStream(__dirname + '/x.html').pipe(tr);
