const trumpet = require('..')
const tryToTape = require('try-to-tape')
const test = tryToTape(require('tape'))

test('select and select all', async (t) => {
  const tr = trumpet()

  tr.selectAll('*')
  tr.selectAll('*')

  tr.on('data', () => {})
  tr.on('end', () => {
    t.end()
  })

  tr.end('<div></div>')
})
