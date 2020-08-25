const Duplex = require('readable-stream').Duplex
const Wrapper = require('./lib/wrap.js')
const through2 = require('through2')
const duplexer = require('duplexer2')
const tokenize = require('html-tokenize')
const select = require('html-select2')

class Trumpet extends Duplex {
  #writing = false;
  #piping = false;
  #tokenize = tokenize();
  #selected = this.#tokenize.pipe(select());

  constructor (options) {
    super(options)
    this.#selected.once('end', () => {
      this.emit('_end')
      this.push(null)
    })
    this.once('finish', () => {
      this.#tokenize.end()
    })
  }

  select (str, cb) {
    let first = true
    const res = this.selectAll(str, (elem) => {
      if (!first) return
      first = false
      res.createReadStream = () => {}
      res.createWriteStream = () => {}
      res.createStream = () => {}
      if (cb) cb(elem)
    })
    return res
  }

  // override stream
  pipe () {
    this.#piping = true
    return super.pipe.apply(this, arguments)
  }

  selectAll (str, cb) {
    const readers = []
    const writers = []
    const duplex = []
    const gets = []
    const getss = []
    const sets = []
    const removes = []

    this.once('_end', () => {
      readers.splice(0).forEach((r) => {
        r.end()
        r.resume()
      })

      duplex.splice(0).forEach((d) => {
        d.input.end()
        d.input.resume()
      })
    })

    let welem
    this.#selected.select(str, (elem) => {
      welem = new Wrapper(elem)
      if (cb) cb(welem)

      elem.once('close', () => {
        welem = null
      })

      readers.splice(0).forEach((r) => {
        welem.createReadStream(r._options).pipe(r)
      })

      writers.splice(0).forEach((w) => {
        w.pipe(welem.createWriteStream(w._options))
      })

      duplex.splice(0).forEach((d) => {
        d.input.pipe(welem.createStream(d.options))
          .pipe(d.output)
      })

      gets.splice(0).forEach((g) => {
        welem.getAttribute(g[0], g[1])
      })

      getss.splice(0).forEach((cb) => {
        welem.getAttributes(cb)
      })

      sets.splice(0).forEach((g) => {
        welem.setAttribute(g[0], g[1])
      })

      removes.splice(0).forEach((key) => {
        welem.removeAttribute(key)
      })
    })

    return {
      getAttribute: (key, cb) => {
        if (welem) return welem.getAttribute(key, cb)
        gets.push([key, cb])
        return this
      },
      getAttributes: (cb) => {
        getss.push(cb)
        return this
      },
      setAttribute: (key, value) => {
        if (welem) return welem.setAttribute(key, value)
        sets.push([key, value])
        return this
      },
      removeAttribute: (key) => {
        if (welem) return welem.removeAttribute(key)
        removes.push(key)
        return this
      },
      createReadStream: (opts) => {
        if (welem) return welem.createReadStream(opts)
        const r = through2()
        r._options = opts
        readers.push(r)
        return r
      },
      createWriteStream: (opts) => {
        if (welem) return welem.createWriteStream(opts)
        const w = through2()
        w._options = opts
        writers.push(w)
        return w
      },
      createStream: (opts) => {
        if (welem) return welem.createStream(opts)
        const d = { input: through2(), output: through2() }
        d.options = opts
        duplex.push(d)
        return duplexer(d.input, d.output)
      }
    }
  }

  // override stream
  _read (n) {
    let read = 0
    let row
    while ((row = this.#selected.read()) !== null) {
      if (row[0] === 'END') {
        this.push(row[1][1])
      } else if (row[1] && row[1].length) {
        this.push(row[1])
      }
      read++
    }
    if (read === 0) this.#selected.once('readable', () => { this._read(n) })
  }

  // override stream
  _write (buf, enc, next) {
    if (!this.#writing && !this.#piping) {
      this.#piping = true
      this.resume()
    }
    // _write is member of readable-stream.Transform
    // noinspection JSUnresolvedFunction
    return this.#tokenize._write(buf, enc, next)
  }

  createReadStream (sel, opts) {
    return this.select(sel).createReadStream(opts)
  }

  createWriteStream (sel, opts) {
    return this.select(sel).createWriteStream(opts)
  }

  createStream (sel, opts) {
    return this.select(sel).createStream(opts)
  }
}

module.exports = () => { return new Trumpet() }
module.exports.Trumpet = Trumpet
