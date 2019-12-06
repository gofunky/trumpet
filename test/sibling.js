const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const through2 = require('through2')

test('sibling selector', async (t) => {
  const tr = trumpet()
  const elem = tr.select('.b + .d')
  elem.getAttribute('class', (value) => {
    t.equal(value, 'd')
    t.end()
  })
  fs.createReadStream(`${__dirname}/sibling.html`).pipe(tr)
})

test('sibling no-match selector', async (t) => {
  const tr = trumpet()
  const elem = tr.select('.c + .d')
  elem.getAttribute('class', () => {
    t.fail('should not have matched')
  })
  fs.createReadStream(`${__dirname}/sibling.html`).pipe(tr)

  tr.pipe(through2.obj(() => {
    t.ok(true)
    t.end()
  }))
})
