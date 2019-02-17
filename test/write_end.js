const trumpet = require('../');
const fs = require('fs');
const test = require('tape');
const concat = require('concat-stream');
const htmlclean = require('htmlclean');

test('write end', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.select('.x b', function (elem) {
        const ws = elem.createWriteStream();
        ws.end('beep boop');
    });
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<!doctype html>'
            + '<html><body><div class="x"><b>beep boop</b></div>'
            + '</body></html>'
        );
    }));
    
    fs.createReadStream(__dirname + '/write_end.html').pipe(tr);
});

test('write end string', function (t) {
    t.plan(1);

    const tr = trumpet();
    tr.select('.x b', function (elem) {
        const ws = elem.createWriteStream();
        ws.end('beep boop');
    });
    
    tr.pipe(concat(function (body) {
        t.equal(
            htmlclean(String(body)),
            '<!doctype html>'
            + '<html><body><div class="x"><b>beep boop</b></div>'
            + '</body></html>'
        );
    }));

    const html = fs.readFileSync(__dirname + '/write_end.html', 'utf8');
    tr.end(html);
}); 
