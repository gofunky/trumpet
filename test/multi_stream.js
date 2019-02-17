const trumpet = require('../')
const test = require('tape')
const fs = require('fs')
const through = require('through')
const concat = require('concat-stream')

test('multiple read streams', function (t) {
  const output = through()
  t.plan(7)
  const tr = trumpet()
  tr.pipe(through(null, function () { output.end() }))

  output.pipe(concat(function (src) {
    t.equal(src.toString(), 'tacosyburritos')
  }))

  const html = [
    'tacos',
    'y',
    'burritos'
  ]
  tr.selectAll('.b span', function (span) {
    t.equal(span.name, 'span')
    const rs = span.createReadStream()
    rs.pipe(output, { end: false })
    rs.pipe(concat(function (src) {
      t.equal(String(src), html.shift())
    }))
  })
  fs.createReadStream(`${__dirname}/multi_stream.html`).pipe(tr)
})
