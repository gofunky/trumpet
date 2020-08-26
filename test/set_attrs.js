const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlClean = require('htmlclean')

test('set attributes', async (t) => {
  const tr = trumpet()
  tr.selectAll('input[type=text]', (elem) => {
    elem.setAttribute('value', elem.getAttribute('value').toUpperCase())
  })

  tr.pipe(concat((src) => {
    t.equal(
      htmlClean(String(src)),
      '<div class="a"><input type="text" value="XYZ"></div>' +
      '<div class="a"><input type="text" value="GHI"></div>'
    )
    t.end()
  }))
  fs.createReadStream(`${__dirname}/set_attrs.html`).pipe(tr)
})

test('create attributes', async (t) => {
  const tr = trumpet()
  tr.selectAll('input[type=text]', (elem) => {
    elem.setAttribute('beep', 'boop')
  })

  tr.pipe(concat((src) => {
    t.equal(
      htmlClean(String(src)),
      '<div class="a"><input type="text" value="xyz" beep="boop"></div>' +
      '<div class="a"><input type="text" value="ghi" beep="boop"></div>'
    )
    t.end()
  }))
  fs.createReadStream(`${__dirname}/set_attrs.html`).pipe(tr)
})
