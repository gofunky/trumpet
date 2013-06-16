var trumpet = require('../');

var tr = trumpet();
//tr.select('div#z').setAttribute('class', 'WOOOOOOOOOOOOOOOOOo');
var elem = tr.select('.b input[type=text]');
elem.setAttribute('value', 'abc');

//tr.pipe(process.stdout);

// tr.createWriteStream('.a')
// tr.select('.a').createWriteStream()

var fs = require('fs');
fs.createReadStream(__dirname + '/through.html').pipe(tr);
