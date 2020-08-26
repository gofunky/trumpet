const trumpet = require('../')
const fs = require('fs')

const tr = trumpet()
tr.selectAll('.b span', (span) => {
  span.createReadStream().pipe(process.stdout)
})

fs.createReadStream(`${__dirname}/html/read_all.html`).pipe(tr)
