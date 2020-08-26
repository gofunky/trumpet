const trumpet = require('../')
const fs = require('fs')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')
const htmlClean = require('htmlClean')

test('write end', async (t) => {
  const tr = trumpet()
  tr.select('.x b', (elem) => {
    const ws = elem.createWriteStream()
    ws.end('beep boop')
  })

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<!doctype html>' +
      '<html><body><div class="x"><b>beep boop</b></div>' +
      '</body></html>'
    )
    t.end()
  }))

  fs.createReadStream(`${__dirname}/write_end.html`).pipe(tr)
})

test('write end string', async (t) => {
  const tr = trumpet()
  tr.select('.x b', (elem) => {
    const ws = elem.createWriteStream()
    ws.end('beep boop')
  })

  tr.pipe(concat((body) => {
    t.equal(
      htmlClean(String(body)),
      '<!doctype html>' +
      '<html><body><div class="x"><b>beep boop</b></div>' +
      '</body></html>'
    )
    t.end()
  }))

  const html = fs.readFileSync(`${__dirname}/write_end.html`, 'utf8')
  tr.end(html)
})
