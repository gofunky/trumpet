const trumpet = require('../')
const fs = require('fs')
const through = require('through2')
const test = require('tape')
const concat = require('concat-stream')
const htmlClean = require('htmlClean')

test('multi write stream out of order', (t) => {
  t.plan(1)

  const tr = trumpet()
  const wsx = tr.select('.x').createWriteStream()
  const wsy = tr.select('.y').createWriteStream()
  const sx = through()
  const sy = through()

  sx.pipe(wsx)
  sy.pipe(wsy)

  sx.write('beep')
  sy.write('beep')

  setTimeout(() => {
    sx.write(' boop.')
    sx.end()
  }, 500)

  setTimeout(() => {
    sy.write(' beep boop.')
    sy.end()
  }, 400)

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<!doctype html>' +
      '<html><body><div class="x">beep boop.</div>' +
      '<div class="y">beep beep boop.</div>' +
      '</body></html>'
    )
  }))

  fs.createReadStream(`${__dirname}/multi_write_stream.html`).pipe(tr)
})
