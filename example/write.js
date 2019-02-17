const trumpet = require('../');
const tr = trumpet();
tr.pipe(process.stdout);

const ws = tr.select('title').createWriteStream();
ws.end('beep boop.');

const fs = require('fs');
fs.createReadStream(__dirname + '/html/write.html').pipe(tr);
