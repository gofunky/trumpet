const test = require('tape');
const trumpet = require('../');
const through = require('through2');
const concat = require('concat-stream');
const fs = require('fs');
const expected = fs.readFileSync(__dirname + '/loud_expected.html', 'utf8');

test('loud', function (t) {
    t.plan(1);
    const tr = trumpet();

    const loud = tr.select('.loud').createStream();
    loud.pipe(through(function (buf, enc, next) {
        this.push(buf.toString().toUpperCase());
        next();
    })).pipe(loud);
    
    fs.createReadStream(__dirname + '/loud.html')
        .pipe(tr)
        .pipe(concat(function (src) {
            t.equal(String(src), expected);
        }))
    ;
});
