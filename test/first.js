const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')

test('first', (t) => {
  t.plan(2)
  const expected = ['AAA', 'DDD']

  const tr = trumpet()
  tr.selectAll('.row *:first-child', (elem) => {
    const ex = expected.shift()
    elem.createReadStream().pipe(concat((body) => {
      t.equal(String(body), ex)
    }))
  })
  fs.createReadStream(`${__dirname}/first.html`).pipe(tr)
})
