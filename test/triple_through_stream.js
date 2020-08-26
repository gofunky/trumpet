const trumpet = require('../')
const fs = require('fs')
const through2 = require('through2')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlClean = require('htmlClean')

test('through stream thrice', async (t) => {
  const tr = trumpet()
  tr.selectAll('div', (div) => {
    const ts = div.createStream()
    ts.pipe(through2.obj((chunk, _, callback) => {
      callback(null, htmlClean(String(chunk)).toUpperCase())
    })).pipe(ts)
  })

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<html><body>' +
      '<div>ABC</div>' +
      '<div>DEF</div>' +
      '<div>GHI</div>' +
      '</body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/triple_through_stream.html`).pipe(tr)
})
