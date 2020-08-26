const trumpet = require('../')
const fs = require('fs')

const tr = trumpet()
tr.selectAll('html *', (elem) => {
  elem.createReadStream()
    .pipe(elem.createWriteStream({ outer: true }))
})
tr.select('html').createReadStream().pipe(process.stdout)

fs.createReadStream(`${__dirname}/html/read_all.html`).pipe(tr)
