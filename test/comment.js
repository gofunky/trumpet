const trumpet = require('../')
const through = require('through2')
const test = require('tape')
const concat = require('concat-stream')

test('comment write stream', function (t) {
  t.plan(1)

  const tr = trumpet()
  const html = tr.select('html')
  const ws = html.createWriteStream()

  const s = through()
  s.pipe(ws)
  s.end()

  const res = '<!-- test --><html></html>'
  tr.pipe(concat(function (body) {
    t.equal(
      body.toString(),
      res
    )
  }))
  tr.end(res)
})

test('comment write stream variant', function (t) {
  t.plan(1)

  const tr = trumpet()
  const html = tr.select('html')
  const ws = html.createWriteStream()

  const s = through()
  s.pipe(ws)
  s.end()

  const res = '<!--test   --><html></html>'
  tr.pipe(concat(function (body) {
    t.equal(
      body.toString(),
      res
    )
  }))
  tr.end(res)
})
