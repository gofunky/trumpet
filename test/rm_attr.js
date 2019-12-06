const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('remove attribute', async (t) => {
  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.removeAttribute('zzz')

  tr.pipe(concat(src => {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="xyz"></div>'
    )
    t.end()
  }))
  fs.createReadStream(`${__dirname}/rm_attr.html`).pipe(tr)
})
