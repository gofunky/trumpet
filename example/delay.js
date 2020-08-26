const trumpet = require('../')
const through = require('through2')
const fs = require('fs')

const tr = trumpet()
tr.pipe(process.stdout)
tr.selectAll('.x span', (span) => {
  const stream = span.createStream()
  stream.pipe(through(
    (buf) => {
      setTimeout(() => {
        this.queue(buf.toString().toUpperCase())
      }, 100)
    }, () => {
      setTimeout(() => {
        this.queue(null)
      }, 100)
    })).pipe(stream)
})

fs.createReadStream(`${__dirname}/html/uppercase.html`).pipe(tr)
