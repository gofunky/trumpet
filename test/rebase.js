const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))

test('wonky duplicated classes selector', async (t) => {
  const tr = trumpet()
  const elem = tr.select('.c')
  elem.getAttribute('class', function (value) {
    t.equal(value, 'c')
    t.end()
  })
  fs.createReadStream(`${__dirname}/rebase.html`).pipe(tr)
})

test('rebase selector', async (t) => {
  const tr = trumpet()
  const elem = tr.select('.a > .b > * > .d')
  elem.getAttribute('class', function (value) {
    t.equal(value, 'd')
    t.end()
  })
  fs.createReadStream(`${__dirname}/rebase.html`).pipe(tr)
})

test('too many ancestors selector', async (t) => {
  const tr = trumpet()
  const elem = tr.select('.a > .b > * > * > .d')
  elem.getAttribute('class', () => {
    t.fail('should not have matched')
    t.end()
  })
  tr.on('end', () => {
    t.ok(true)
    t.end()
  })
  fs.createReadStream(`${__dirname}/rebase.html`).pipe(tr)
})

test('get all class names', async (t) => {
  t.plan(6)
  const names = ['a', 'b', 'a', 'b', 'c', 'd']
  const tr = trumpet()

  tr.selectAll('div', (elem) => {
    elem.getAttribute('class', (value) => {
      t.equal(value, names.shift())
    })
  })
  fs.createReadStream(`${__dirname}/rebase.html`).pipe(tr)
})

test('all class name pairs', async (t) => {
  const tr = trumpet()
  const names = []

  tr.selectAll('div > div', (elem) => {
    elem.getAttribute('class', (value) => {
      names.push(value)
    })
  })
  tr.on('end', () => {
    t.deepEqual(names, ['b', 'a', 'b', 'c', 'd'])
    t.end()
  })
  fs.createReadStream(`${__dirname}/rebase.html`).pipe(tr)
})
