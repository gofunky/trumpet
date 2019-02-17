const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('set attribute', function (t) {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.setAttribute('value', 'abc')

  tr.pipe(concat(function (src) {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="abc"></div>'
    )
  }))
  fs.createReadStream(`${__dirname}/set_attr.html`).pipe(tr)
})

test('create attribute', function (t) {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('input[type=text]')
  elem.setAttribute('beep', 'boop')

  tr.pipe(concat(function (src) {
    t.equal(
      htmlclean(String(src)),
      '<div class="a"><input type="text" value="xyz" beep="boop"></div>'
    )
  }))
  fs.createReadStream(`${__dirname}/set_attr.html`).pipe(tr)
})
