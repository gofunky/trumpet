const test = require('tape')
const trumpet = require('../')
const through = require('through2')
const concat = require('concat-stream')
const fs = require('fs')
const expected = fs.readFileSync(`${__dirname}/loud_expected.html`, 'utf8')

test('loud delay cb', (t) => {
  t.plan(1)
  const tr = trumpet()

  tr.select('.loud', (elem) => {
    const loud = elem.createStream()
    loud.pipe(through((buf, enc, next) => {
      setTimeout(() => {
        this.push(buf.toString().toUpperCase())
        next()
      }, 10)
    })).pipe(loud)
  })

  fs.createReadStream(`${__dirname}/loud.html`)
    .pipe(tr)
    .pipe(concat((src) => {
      t.equal(String(src), expected)
    }))
})
