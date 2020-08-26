const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')
const htmlClean = require('htmlclean')

test('stream all divs', (t) => {
  t.plan(3)

  const html = [
    '',
    '<div class="c"></div>',
    '<div class="b"><div class="c"></div></div>'
  ]

  const tr = trumpet()
  tr.selectAll('div', (div) => {
    div.createReadStream().pipe(concat((src) => {
      t.equal(htmlClean(src.toString()), html.shift())
    }))
  })
  fs.createReadStream(`${__dirname}/overlapping_reads.html`).pipe(tr)
})
