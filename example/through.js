var trumpet = require('../');

var tr = trumpet();
//tr.select('div#z').setAttribute('class', 'WOOOOOOOOOOOOOOOOOo');
tr.select('input[type]').getAttribute('value', function (value) {
    console.log('value=' + value);
});
//tr.pipe(process.stdout);

// tr.createWriteStream('.a')
// tr.select('.a').createWriteStream()

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
