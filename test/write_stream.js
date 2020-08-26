const trumpet = require('../')
const fs = require('fs')
const through2 = require('through2')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('outer write stream', async (t) => {
  const tr = trumpet()
  const ws = tr.select('div').createWriteStream({ outer: true })
  const s = through2()
  s.pipe(ws)

  s.write('<B>beep')

  setTimeout(() => {
    s.write(' boop.</B>')
    s.end()
  }, 500)

  tr.pipe(concat((body) => {
    t.equal(
      htmlclean(String(body)),
      '<!doctype html>' +
      '<html><body> <B>beep boop.</B></body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/write_stream.html`).pipe(tr)
})

test('write stream', async (t) => {
  const tr = trumpet()
  const ws = tr.select('div').createWriteStream()
  const s = through2()
  s.pipe(ws)

  s.write('beep')

  setTimeout(() => {
    s.write(' boop.')
    s.end()
  }, 500)

  tr.pipe(concat((body) => {
    t.equal(
      htmlclean(String(body)),
      '<!doctype html>' +
      '<html><body><div class="x">beep boop.</div>' +
      '</body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/write_stream.html`).pipe(tr)
})
