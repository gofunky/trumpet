const trumpet = require('../')
const fs = require('fs')
const through = require('through')
const test = require('tape')
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('multi write stream in order', function (t) {
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

  setTimeout(function () {
    sx.write(' boop.')
    sx.end()
  }, 500)

  setTimeout(function () {
    sy.write(' beep boop.')
    sy.end()
  }, 600)

  tr.pipe(concat(function (body) {
    t.equal(
      htmlclean(body.toString()),
      '<!doctype html>' +
      '<html><body><div class="x">beep boop.</div>' +
      '<div class="y">beep beep boop.</div>' +
      '</body></html>'
    )
  }))

  fs.createReadStream(`${__dirname}/multi_write_stream.html`).pipe(tr)
})
