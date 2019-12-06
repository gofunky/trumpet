const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const html = fs.readFileSync(`${__dirname}/read_stream.html`)

test('outer stream', async (t) => {
  t.plan(3)

  const tr = trumpet()

  tr.select('.a').createReadStream({ outer: true })
    .pipe(concat(body => {
      t.equal(String(body), '<div class="a">AAA</div>')
    }))

  const b = tr.select('.b')
  b.getAttribute('class', v => {
    t.equal(v, 'b')
  })
  b.createReadStream({ outer: true })
    .pipe(concat(body => {
      t.equal(String(body), '<div class="b">X<b>Y</b>Z</div>')
    }))

  fs.createReadStream(`${__dirname}/read_stream.html`).pipe(tr)
})

test('read stream', async (t) => {
  t.plan(3)

  const tr = trumpet()

  tr.select('.a').createReadStream()
    .pipe(concat(body => {
      t.equal(String(body), 'AAA')
    }))

  const b = tr.select('.b')
  b.getAttribute('class', v => {
    t.equal(v, 'b')
  })
  b.createReadStream().pipe(concat(body => {
    t.equal(String(body), 'X<b>Y</b>Z')
  }))

  fs.createReadStream(`${__dirname}/read_stream.html`).pipe(tr)
})

test('overlapping read streams', async (t) => {
  t.plan(4)

  const tr = trumpet()
  const body = tr.select('body')
  body.createReadStream().pipe(concat(src => {
    const i = /<body>/.exec(html).index + 6
    const j = /<\/body>/.exec(html).index
    t.equal(String(src), String(html.slice(i, j)))
  }))

  tr.select('.a').createReadStream()
    .pipe(concat(body => {
      t.equal(String(body), 'AAA')
    }))

  const b = tr.select('.b')
  b.getAttribute('class', v => {
    t.equal(v, 'b')
  })
  b.createReadStream().pipe(concat(body => {
    t.equal(String(body), 'X<b>Y</b>Z')
  }))

  fs.createReadStream(`${__dirname}/read_stream.html`).pipe(tr)
})

test('stream all divs', async (t) => {
  t.plan(9)
  const html = ['AAA', 'X<b>Y</b>Z', 'CCC']
  const classes = ['a', 'b', 'c']

  const tr = trumpet()
  tr.selectAll('div', div => {
    const c_ = classes.shift()
    t.equal(div.getAttribute('class'), c_)

    div.getAttribute('class', c => {
      t.equal(c, c_)
    })

    div.createReadStream().pipe(concat(src => {
      t.equal(String(src), html.shift())
    }))
  })

  fs.createReadStream(`${__dirname}/read_stream.html`).pipe(tr)
})

test('end event when no match', async (t) => {
  // Make sure an end event is emitted even with no "h1" element"
  const tr = trumpet()
  tr.createReadStream('h1').on('end', () => {
    t.end()
  })
  fs.createReadStream(`${__dirname}/read_stream.html`).pipe(tr)
})
