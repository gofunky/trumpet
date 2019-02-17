const trumpet = require('../');
const tr = trumpet();

tr.select('.msg').createReadStream().pipe(process.stdout);

const fs = require('fs');
fs.createReadStream(__dirname + '/html/read.html').pipe(tr);
