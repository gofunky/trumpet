const trumpet = require('../')
const fs = require('fs')
const through2 = require('through2')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlClean = require('htmlclean')

test('outer through stream', async (t) => {
  const tr = trumpet()
  const ts = tr.select('div').createStream({ outer: true })
  ts.pipe(through2.obj((chunk, _, callback) => {
    callback(null, String(chunk).toUpperCase())
  })).pipe(ts)

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<html><body><DIV>XYZ</DIV></body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/through_stream.html`).pipe(tr)
})

test('through stream', async (t) => {
  const tr = trumpet()
  const ts = tr.select('div').createStream()
  ts.pipe(through2.obj((chunk, _, callback) => {
    callback(null, String(chunk).toUpperCase())
  })).pipe(ts)

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<html><body><div>XYZ</div></body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/through_stream.html`).pipe(tr)
})
