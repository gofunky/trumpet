const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const through = require('through2')

test('child selector', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.c > input[type=text]')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'abc')
  })
  fs.createReadStream(`${__dirname}/child.html`).pipe(tr)
})

test('child no-match selector', (t) => {
  t.plan(1)

  const tr = trumpet()
  tr.pipe(through(null, () => {
    t.ok(true)
  }))
  const elem = tr.select('.b > input[type=text]')
  elem.getAttribute('value', (_) => {
    t.fail('should not have matched')
  })
  fs.createReadStream(`${__dirname}/child.html`).pipe(tr)
})

test('child start then no match selector', (t) => {
  t.plan(1)

  const tr = trumpet()
  tr.pipe(through(null, () => {
    t.ok(true)
  }))
  const elem = tr.select('.b > .d')
  elem.getAttribute('class', (_) => {
    t.fail('should not have matched')
  })
  fs.createReadStream(`${__dirname}/child.html`).pipe(tr)
})

test('child with similar grandchild selector', (t) => {
  t.plan(2)

  const tr = trumpet()
  tr.selectAll('.a > div', (elem) => {
    elem.getAttribute('class', (value) => {
      t.notEqual(value, 'c', 'should not have matched')
    })
  })
  fs.createReadStream(`${__dirname}/child.html`).pipe(tr)
})
