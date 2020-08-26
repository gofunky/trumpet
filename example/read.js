const trumpet = require('../')
const fs = require('fs')

const tr = trumpet()
tr.select('.msg').createReadStream().pipe(process.stdout)

fs.createReadStream(`${__dirname}/html/read.html`).pipe(tr)
