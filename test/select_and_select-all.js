const trumpet = require('..');
const test = require('tape');

test('select and select all', function (t) {
    const tr = trumpet();

    tr.selectAll('*');
    tr.selectAll('*');

    tr.on('data', function () {});
    tr.on('end', function () { t.end() });

    tr.end('<div></div>');
});
