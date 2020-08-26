const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('multi file write stream in order', (t) => {
  t.plan(1)

  const tr = trumpet()

  const sx = fs.createReadStream(`${__dirname}/multi_file_write_stream_x.html`)
  const sy = fs.createReadStream(`${__dirname}/multi_file_write_stream_y.html`)

  const wsx = tr.select('.x').createWriteStream()
  const wsy = tr.select('.y').createWriteStream()

  sx.pipe(wsx)
  sy.pipe(wsy)

  tr.pipe(concat((body) => {
    t.equal(
      htmlclean(String(body)),
      '<!doctype html>' +
      '<html><body><div class="x">beep boop.</div>' +
      '<div class="y">beep beep boop.</div>' +
      '</body></html>'
    )
  }))

  fs.createReadStream(`${__dirname}/multi_file_write_stream.html`).pipe(tr)
})
