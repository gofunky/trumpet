const Duplex = require('readable-stream').Duplex
const Readable = require('readable-stream').Readable
const Writable = require('readable-stream').Writable

const wrappedRead = (stream, readable) => {
  return () => {
    let row
    let reads = 0
    while ((row = stream.read()) !== null) {
      if (row[1].length) {
        readable.push(row[1])
        reads++
      }
    }
    if (reads === 0) stream.once('readable', wrappedRead(stream, readable))
  }
}

class Wrapper {
  #elem;

  constructor (elem) {
    this.#elem = elem
  }

  get name () {
    return this.#elem.name
  }

  set name (value) {
    this.#elem.name = value
  }

  getAttribute (key, cb) {
    const value = this.#elem.getAttribute(String(key).toLowerCase())
    if (cb) cb(value)
    return value
  }

  getAttributes (cb) {
    const attrs = this.#elem.getAttributes()
    if (cb) cb(attrs)
    return attrs
  }

  setAttribute (key, value) {
    this.#elem.setAttribute(key, value)
  }

  removeAttribute (key) {
    this.#elem.removeAttribute(key)
  }

  createReadStream (opts) {
    if (!opts) opts = {}

    const rs = this.#elem.createReadStream({ inner: !opts.outer })
    const r = new Readable()
    r._read = wrappedRead(rs, r)
    rs.on('end', () => { r.push(null) })

    return r
  }

  createWriteStream (opts) {
    if (!opts) opts = {}

    const ws = this.#elem.createWriteStream({ inner: !opts.outer })
    const w = new Writable()
    w._write = (buf, enc, next) => {
      ws.write(['data', buf])
      next()
    }
    w.on('finish', () => { ws.end() })

    return w
  }

  createStream (opts) {
    if (!opts) opts = {}

    const s = this.#elem.createStream({ inner: !opts.outer })
    const d = new Duplex()

    d._write = (buf, enc, next) => {
      s.write(['data', buf])
      next()
    }
    d._read = wrappedRead(s, d)

    d.on('finish', () => { s.end() })
    s.on('end', () => { d.push(null) })

    return d
  }
}

module.exports = Wrapper
