const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('stream all divs', function (t) {
    t.plan(3);

    const html = [
        '',
        '<div class="c"></div>',
        '<div class="b"><div class="c"></div></div>'
    ];

    const tr = trumpet();
    tr.selectAll('div', function (div) {
        div.createReadStream().pipe(concat(function (src) {
            t.equal(htmlclean(src.toString()), html.shift());
        }));
    });
    fs.createReadStream(__dirname + '/overlapping_reads.html').pipe(tr);
});
