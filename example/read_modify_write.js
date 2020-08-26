const trumpet = require('../')
const through = require('through2')
const fs = require('fs')

const tr = trumpet()

// select all element and apply transformation function to selections
tr.selectAll('.x span', (element) => {
  // define function to transform input
  const upper = through((buf) => {
    this.queue(buf.toString().toUpperCase())
  })

  // create a read/write stream for selected element
  const stream = element.createStream()

  // stream the element's inner html to transformation function
  // then stream the transformed output back into the element stream
  stream.pipe(upper).pipe(stream)
})

// stream in html to trumpet and stream processed output to stdout
fs.createReadStream(`${__dirname}/html/uppercase.html`).pipe(tr).pipe(process.stdout)
