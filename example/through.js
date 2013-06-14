var trumpet = require('../');

var tr = trumpet();
tr.select('div.a').setAttribute('id', 'XYZ!!!!!!!!!');
tr.pipe(process.stdout);

/*
tr.select('div.a').getAttribute('id', function (value) {
    console.log('value=' + value);
});
*/

// tr.createWriteStream('.a')
// tr.select('.a').createWriteStream()

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
