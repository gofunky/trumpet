const test = require('tape')
const trumpet = require('../')
const concat = require('concat-stream')
const fs = require('fs')
const expected = fs.readFileSync(`${__dirname}/partial_expected.html`, 'utf8')

test('partial html', function (t) {
  t.plan(1)
  const tr = trumpet()

  tr.selectAll('script', function (node) {
    node.setAttribute('src', 'updated')
  })

  fs.createReadStream(`${__dirname}/partial.html`)
    .pipe(tr)
    .pipe(concat(function (src) {
      t.equal(String(src), expected)
    }))
})
