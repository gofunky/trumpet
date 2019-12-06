const trumpet = require('../')
const through2 = require('through2')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))
const concat = require('concat-stream')

test('uppercase script contents', async (t) => {
  const tr = trumpet()
  const ts = tr.select('script').createStream()
  ts.pipe(through2.obj((chunk, _, callback) => {
    callback(null, String(chunk).toUpperCase())
  })).pipe(ts)

  tr.pipe(concat((body) => {
    t.equal(
      body.toString(),
      '<html><head>' +
      '<script type="robots">BEEPITY BOOP</script>' +
      '</head></html>'
    )
    t.end()
  }))

  tr.write('<html><head>')
  tr.write('<script type="robots">beepity boop</script>')
  tr.write('</head></html>')
  tr.end()
})

test('uppercase script outer', async (t) => {
  const tr = trumpet()
  const ts = tr.select('script').createStream({ outer: true })
  ts.pipe(through2.obj((chunk, _, callback) => {
    callback(null, String(chunk).toUpperCase())
  })).pipe(ts)

  tr.pipe(concat(function (body) {
    t.equal(
      body.toString(),
      '<html><head>' +
      '<SCRIPT TYPE="ROBOTS">BEEPITY BOOP</SCRIPT>' +
      '</head></html>'
    )
    t.end()
  }))

  tr.write('<html><head>')
  tr.write('<script type="robots">beepity boop</script>')
  tr.write('</head></html>')
  tr.end()
})
