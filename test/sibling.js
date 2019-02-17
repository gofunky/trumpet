const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const through = require('through')

test('sibling selector', function (t) {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.b + .d')
  elem.getAttribute('class', function (value) {
    t.equal(value, 'd')
  })
  fs.createReadStream(`${__dirname}/sibling.html`).pipe(tr)
})

test('sibling no-match selector', function (t) {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.c + .d')
  elem.getAttribute('class', function (value) {
    t.fail('should not have matched')
  })
  fs.createReadStream(`${__dirname}/sibling.html`).pipe(tr)

  tr.pipe(through(null, function () { t.ok(true) }))
})
