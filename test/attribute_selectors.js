const trumpet = require('../')
const fs = require('fs')
const test = require('tape')
const concat = require('concat-stream')

test('selected element has attribute [att]', (t) => {
  t.plan(1)

  const tr = trumpet()
  tr.createReadStream('li[data-foo]').pipe(concat((elem) => {
    t.equal(elem.toString(), 'item2')
  }))
  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element has attribute value [att=val]', (t) => {
  t.plan(1)

  const tr = trumpet()
  tr.createReadStream('li[class="item1 item-first"]').pipe(concat((elem) => {
    t.equal(elem.toString(), 'item1')
  }))
  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element contains whitespace separated attribute value [att~=val]', (t) => {
  t.plan(1)

  const tr = trumpet()
  tr.createReadStream('li[class~=item-first]').pipe(concat((elem) => {
    t.equal(elem.toString(), 'item1')
  }))
  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element attribute value equals or starts with and followed by - [att|=val]', (t) => {
  const items = ['item1', 'item3', 'item4']
  t.plan(items.length)

  const tr = trumpet()
  tr.selectAll('li[data-role|=item]', (elem) => {
    elem.createReadStream().pipe(concat((src) => {
      t.equal(src.toString(), items.shift())
    }))
  })

  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element has attribute (att) value starting with (val) [att^=val]', (t) => {
  const items = ['item1', 'item2', 'item3', 'item4']
  t.plan(items.length)

  const tr = trumpet()
  tr.selectAll('li[class^=item]', (elem) => {
    elem.createReadStream().pipe(concat((src) => {
      t.equal(src.toString(), items.shift())
    }))
  })

  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element has attribute (att) value ending with (val) [att$=val]', (t) => {
  const items = ['item4']
  t.plan(items.length)

  const tr = trumpet()
  tr.selectAll('li[data-role$=last]', (elem) => {
    elem.createReadStream().pipe(concat((src) => {
      t.equal(src.toString(), items.shift())
    }))
  })

  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})

test('selected element has attribute (att) value containing (val) [att*=val]', (t) => {
  const items = ['item2', 'item5']
  t.plan(items.length)

  const tr = trumpet()
  tr.selectAll('li[data-foo*=random]', (elem) => {
    elem.createReadStream().pipe(concat((src) => {
      t.equal(src.toString(), items.shift())
    }))
  })

  fs.createReadStream(`${__dirname}/attribute_selectors.html`).pipe(tr)
})
