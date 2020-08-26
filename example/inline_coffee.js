const trumpet = require('../')
const fs = require('fs')
const through = require('through2')
const duplexer = require('duplexer2')
const concat = require('concat-stream')
const coffee = require('coffeescript')

const coffeeStream = (() => {
  const output = through()
  const input = concat((body) => {
    output.queue(coffee.compile(String(body)))
    output.queue(null)
  })
  return duplexer(input, output)
})()

const tr = trumpet()
tr.pipe(process.stdout)

const stream = tr.createStream('script[type="coffee-script"]')
stream.pipe(coffeeStream).pipe(stream)
fs.createReadStream(`${__dirname}/html/inline_coffee.html`).pipe(tr)
