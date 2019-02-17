const trumpet = require('../');
const tr = trumpet();

tr.selectAll('.b span', function (span) {
    span.createReadStream().pipe(process.stdout);
});

const fs = require('fs');
fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr);
