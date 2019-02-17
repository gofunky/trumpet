const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('remove attribute', function (t) {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.removeAttribute('zzz')

  tr.pipe(concat(function (src) {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="xyz"></div>'
    )
  }))
  fs.createReadStream(`${__dirname}/rm_attr.html`).pipe(tr)
})
