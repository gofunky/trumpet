const trumpet = require('../')
const fs = require('fs')

const tr = trumpet()
tr.pipe(process.stdout)

const ws = tr.select('title').createWriteStream()
ws.end('beep boop.')

fs.createReadStream(`${__dirname}/html/write.html`).pipe(tr)
