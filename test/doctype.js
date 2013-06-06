var test = require('tap').test;
var trumpet = require('../');
var fs = require('fs');
var concat = require('concat-stream');

test('doctype tags', function(t) {
    t.plan(1);
    var tr = trumpet();
    fs.createReadStream(__dirname + '/doctype.html').pipe(tr);
    tr.select('div', function (node) {
        node.html(function (html) {
            t.equal(html, '\n  ');
        });
    });
});

test('alternate whitespace doctype', function(t) {
    t.plan(2);
    var tr = trumpet();
    fs.createReadStream(__dirname + '/doctype_whitespace.html').pipe(tr);
    tr.select('div', function (node) {
        node.update(function (html) {
            t.equal(html, '\n  ');
            return 'xyz';
        });
    });
    tr.pipe(concat(function (src) {
        t.equal(src, [
            '<!DOCTYPE       htmlabcdefghijklmn  http://beep.boop     >',
            '<html>',
            '<head>',
            '</head>',
            '<body>',
            '  <div>xyz</div>',
            '</body>',
            '</html>',
            ''
        ].join('\n'));
    }));
});
