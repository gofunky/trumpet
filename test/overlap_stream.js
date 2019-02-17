const trumpet = require('../')
const fs = require('fs')
const through = require('through')
const test = require('tape')
const concat = require('concat-stream')
const htmlclean = require('htmlclean')

test('overlap prepend stream', function (t) {
  t.plan(1)
  const tr = trumpet()

  tr.selectAll('script', function (elem) {
    const a = elem.createStream({ outer: true })
    a.write('-----\n')
    a.pipe(through()).pipe(a)
  })

  const elem = tr.select('body')
  const b = elem.createStream()
  b.pipe(through(null, function () {
    this.queue('!!!!!\n')
    this.queue(null)
  })).pipe(b)

  tr.pipe(concat(function (body) {
    t.equal(
      htmlclean(body.toString()),
      '<html>' +
      '<head>' +
      ' -----' +
      '<script src="/a.js"></script>' +
      '</head>' +
      '<body>' +
      ' -----' +
      '<script src="/b.js"></script>' +
      ' !!!!!' +
      '</body>' +
      '</html>'
    )
  }))
  fs.createReadStream(`${__dirname}/overlap_stream.html`).pipe(tr)
})
