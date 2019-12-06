const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('set attribute', async (t) => {
  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.setAttribute('value', 'abc')

  tr.pipe(concat(src => {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="abc"></div>'
    )
    t.end()
  }))
  fs.createReadStream(`${__dirname}/set_attr.html`).pipe(tr)
})

test('create attribute', async (t) => {
  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.setAttribute('beep', 'boop')

  tr.pipe(concat(src => {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="xyz" beep="boop"></div>'
    )
    t.end()
  }))
  fs.createReadStream(`${__dirname}/set_attr.html`).pipe(tr)
})
