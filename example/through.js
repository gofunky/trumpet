var trumpet = require('../');

var tr = trumpet();
tr.select('.a').setAttribute('xyz', '123');
tr.pipe(process.stdout);

// tr.createWriteStream('.a')
// tr.select('.a').createWriteStream()

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
