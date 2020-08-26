const trumpet = require('../')
const test = require('tape')
const concat = require('concat-stream')
const fs = require('fs')

test((t) => {
  t.plan(2)

  const tr = trumpet()
  tr.createReadStream('article username').pipe(concat((body) => {
    t.equal(body.toString(), '<a href="/user/echojs">echojs</a>')
  }))

  tr.createReadStream('article span').pipe(concat((body) => {
    t.equal(body.toString(), '2')
  }))

  fs.createReadStream(`${__dirname}/article.html`).pipe(tr)
})
