const trumpet = require('../')
const fs = require('fs')
const test = require('tape')

test('h1 is first, select h1', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.a h1')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'ah1')
  })
  fs.createReadStream(`${__dirname}/misc_tags.html`).pipe(tr)
})

test('h1 is first, select em', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.a em')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'aem')
  })
  fs.createReadStream(`${__dirname}/misc_tags.html`).pipe(tr)
})

test('em is first, select h1', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.b h1')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'bh1')
  })
  fs.createReadStream(`${__dirname}/misc_tags.html`).pipe(tr)
})

test('em is first, select em', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.b em')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'bem')
  })
  fs.createReadStream(`${__dirname}/misc_tags.html`).pipe(tr)
})

test('deeply nested', (t) => {
  t.plan(1)

  const tr = trumpet()
  const elem = tr.select('.c h1')
  elem.getAttribute('value', (value) => {
    t.equal(value, 'ch1')
  })
  fs.createReadStream(`${__dirname}/misc_tags.html`).pipe(tr)
})
