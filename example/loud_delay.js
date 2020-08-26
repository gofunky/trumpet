const trumpet = require('../')
const through = require('through2')
const fs = require('fs')

const tr = trumpet()
const loud = tr.select('.loud').createStream()
loud.pipe(through((buf, enc, next) => {
  setTimeout(() => {
    this.push(String(buf).toUpperCase())
    next()
  }, 10)
})).pipe(loud)

fs.createReadStream(`${__dirname}/../test/loud.html`)
  .pipe(tr).pipe(process.stdout)
