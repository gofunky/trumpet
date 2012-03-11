var transit = require('../');
var fs = require('fs');

var tr = transit();
fs.createReadStream(__dirname + '/select.html').pipe(tr);
    
tr.select('.a', function (node) {
    console.log(
        node.name
        + (node.attributes.class ? '.' + node.attributes.class : '')
        + (node.attributes.id ? '#' + node.attributes.id : '')
    );
    node.text(function (text) {
        console.log('    ' + JSON.stringify(text));
    });
});
