const Duplex = require('readable-stream').Duplex
const Readable = require('readable-stream').Readable
const Writable = require('readable-stream').Writable

module.exports = function (elem) {
  const welem = {}

  welem.name = elem.name

  welem.getAttribute = function (key, cb) {
    const value = elem.getAttribute(String(key).toLowerCase())
    if (cb) cb(value)
    return value
  }

  welem.getAttributes = function (cb) {
    const attrs = elem.getAttributes()
    if (cb) cb(attrs)
    return attrs
  }

  welem.setAttribute = function (key, value) {
    elem.setAttribute(key, value)
  }

  welem.removeAttribute = function (key) {
    elem.removeAttribute(key)
  }

  welem.createReadStream = function (opts) {
    if (!opts) opts = {}

    const rs = elem.createReadStream({ inner: !opts.outer })
    const r = new Readable()
    r._read = function read () {
      let row
      let reads = 0
      while ((row = rs.read()) !== null) {
        if (row[1].length) {
          r.push(row[1])
          reads++
        }
      }
      if (reads === 0) rs.once('readable', read)
    }
    rs.on('end', function () { r.push(null) })

    return r
  }

  welem.createWriteStream = function (opts) {
    if (!opts) opts = {}

    const ws = elem.createWriteStream({ inner: !opts.outer })
    const w = new Writable()
    w._write = function (buf, enc, next) {
      ws.write(["data", buf])
      next()
    }
    w.on('finish', function () { ws.end() })

    return w
  }

  welem.createStream = function (opts) {
    if (!opts) opts = {}

    const d = new Duplex()
    const s = elem.createStream({ inner: !opts.outer })

    d._write = function (buf, enc, next) {
      s.write(['data', buf])
      next()
    }

    d._read = function read () {
      let row
      let reads = 0
      while ((row = s.read()) !== null) {
        if (row[1].length) {
          d.push(row[1])
          reads++
        }
      }
      if (reads === 0) s.once('readable', read)
    }

    d.on('finish', function () { s.end() })
    s.on('end', function () { d.push(null) })

    return d
  }

  return welem
}
