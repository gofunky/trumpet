const trumpet = require('../');
const fs = require('fs');
const through = require('through');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('through stream thrice', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.selectAll('div', function (div) {
        const ts = div.createStream();
        ts.pipe(through(function (buf) {
            this.queue(htmlclean(String(buf)).toUpperCase());
        })).pipe(ts);
    });
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<html><body>'
            + '<div>ABC</div>'
            + '<div>DEF</div>'
            + '<div>GHI</div>'
            + '</body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/triple_through_stream.html').pipe(tr);
});
