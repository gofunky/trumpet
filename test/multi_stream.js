const trumpet = require('../')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const fs = require('fs')
const through2 = require('through2')
const concat = require('concat-stream')

test('multiple read streams', async (t) => {
  t.plan(7)
  const html = [
    'tacos',
    'y',
    'burritos'
  ]
  const output = through2()
  output.pipe(concat(function (src) {
    t.equal(src.toString(), 'tacosyburritos')
    t.end()
  }))

  const tr = trumpet()
  tr.selectAll('.b span', function (span) {
    t.equal(span.name, 'span')
    const rs = span.createReadStream()
    rs.pipe(output, { end: false })
    rs.pipe(concat(function (src) {
      t.equal(String(src), html.shift())
    }))
  })
  tr.on('end', () => {
    output.end()
  })
  fs.createReadStream(`${__dirname}/multi_stream.html`).pipe(tr)
})
