const trumpet = require('../');
const through = require('through2');
const fs = require('fs');
const tr = trumpet();

const loud = tr.select('.loud').createStream();
loud.pipe(through(function (buf, enc, next) {
    const self = this;
    setTimeout(function () {
        self.push(buf.toString().toUpperCase());
        next();
    }, 10);
})).pipe(loud);

fs.createReadStream(__dirname + '/../test/loud.html')
    .pipe(tr).pipe(process.stdout)
;
