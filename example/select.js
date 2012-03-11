var transit = require('../');
var fs = require('fs');

var tr = transit();
fs.createReadStream(__dirname + '/select.html').pipe(tr);
    
tr.select('.b span', function (node) {
    console.dir(node);
});
