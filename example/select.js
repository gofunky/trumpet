var transit = require('../');
var tr = transit();

tr.select('.b span', function (node) {
    node.text(function (text) {
        console.log(node.name + ': ' + text);
    });
});

var fs = require('fs');
fs.createReadStream(__dirname + '/select.html').pipe(tr);
