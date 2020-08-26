const select = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlClean = require('htmlclean')

const expected = '<div class="row cool"><div key="msg">wow</div></div>'

test('attr and deeper', async (t) => {
  const sel = select()
  sel.select('.row', (elem) => {
    elem.setAttribute('class', 'row cool')
  })
  sel.select('[key="msg"]', (elem) => {
    elem.createWriteStream({ outer: false }).end('wow')
  })
  fs.createReadStream(`${__dirname}/attr_and_deeper.html`)
    .pipe(sel)
    .pipe(concat((body) => {
      t.equal(htmlClean(String(body)), expected)
      t.end()
    }))
})
