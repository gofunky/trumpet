var transit = require('./');
var tr = transit(function (node) {
    if (node.type === 'open' || node.type === 'close') {
        node.write('(' + node.source.slice(1, -1) + ')');
    }
    else {
        node.write(node.source);
    }
});
tr.pipe(process.stdout, { end : false });

var fs = require('fs');
fs.createReadStream(__dirname + '/x.html').pipe(tr);
