const trumpet = require('../');
const tr = trumpet();
const through = require('through');
tr.pipe(process.stdout);

tr.selectAll('.x span', function (span) {
    const stream = span.createStream();
    stream.pipe(through(write, end)).pipe(stream);
    
    function write (buf) {
        const self = this;
        setTimeout(function () {
            self.queue(buf.toString().toUpperCase());
        }, 100);
    }
    function end () {
        const self = this;
        setTimeout(function () {
            self.queue(null);
        }, 100);
    }
});

const fs = require('fs');
fs.createReadStream(__dirname + '/html/uppercase.html').pipe(tr);
