const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const through = require('through2')

test('descendant selector', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.a input[type=text]')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'abc')
  })
  fs.createReadStream(`${__dirname}/descendant.html`).pipe(tr)
})

test('descendant no-match selector', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.b .d')
  elem.getAttribute('class', (value) => {
    t.fail('should not have matched')
  })
  fs.createReadStream(`${__dirname}/descendant.html`).pipe(tr)

  tr.pipe(through(null, () => { t.ok(true) }))
})
