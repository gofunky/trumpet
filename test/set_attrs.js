const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('set attributes', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.selectAll('input[type=text]', function (elem) {
        elem.setAttribute('value', elem.getAttribute('value').toUpperCase());
    });
    
    tr.pipe(concat(function (src) {
        t.equal(
            htmlclean(String(src)),
            '<div class="a"><input type="text" value="XYZ"></div>'
            + '<div class="a"><input type="text" value="GHI"></div>'
        );
    }));
    fs.createReadStream(__dirname + '/set_attrs.html').pipe(tr);
});

test('create attributes', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.selectAll('input[type=text]', function (elem) {
        elem.setAttribute('beep', 'boop');
    });
    
    tr.pipe(concat(function (src) {
        t.equal(
            htmlclean(String(src)),
            '<div class="a"><input type="text" value="xyz" beep="boop"></div>'
            + '<div class="a"><input type="text" value="ghi" beep="boop"></div>'
        );
    }));
    fs.createReadStream(__dirname + '/set_attrs.html').pipe(tr);
});
