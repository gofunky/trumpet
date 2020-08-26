const trumpet = require('../')
const fs = require('fs')
const test = require('tape')

test('get attribute', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.b input[type=text]')
  elem.getAttribute('value', (value) => {
    t.equal(value, '¡¡¡')
  })
  fs.createReadStream(`${__dirname}/get_attr.html`).pipe(tr)
})

test('get 1 div', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('div')
  elem.getAttribute('class', (value) => {
    t.equal(value, 'a')
  })
  fs.createReadStream(`${__dirname}/get_attr.html`).pipe(tr)
})

test('get all divs', (t) => {
  t.plan(2)
  const names = ['a', 'b']

  const tr = trumpet()
  tr.selectAll('div', (elem) => {
    elem.getAttribute('class', (value) => {
      t.equal(value, names.shift())
    })
  })
  fs.createReadStream(`${__dirname}/get_attr.html`).pipe(tr)
})
