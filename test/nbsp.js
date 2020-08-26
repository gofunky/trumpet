const trumpet = require('../')
const test = require('tape')
const concat = require('concat-stream')

const html = 'Category:&nbsp;&nbsp;&nbsp;<select></select>'
const expected = 'Category:&nbsp;&nbsp;&nbsp;<select id="xyz"></select>'

test('&nbsp;', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('select')
  elem.setAttribute('id', 'xyz')

  tr.pipe(concat((src) => {
    t.equal(String(src), expected)
  }))
  tr.end(html)
})
