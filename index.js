var through = require('through');
var tokenize = require('./lib/tokenize.js');
var parseSelector = require('./lib/selector.js');
var matcher = require('./lib/matcher.js');
var ent = require('ent');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

module.exports = function (opts) {
    var selectors = [];
    var tokens = tokenize();
    var skipping = false;
    
    tokens.pipe(through(write, end));
    
    var tr = through(
        function (buf) { tokens.write(buf) },
        function () { tokens.end() }
    );
    
    tr.select = function (sel) {
        var r = new Result(sel);
        r._matcher.once('unmatch', function () {
            if (!r._reading && !r._writing) {
                var ix = selectors.indexOf(r);
                if (ix >= 0) selectors.splice(ix, 1);
            }
        });
        r.once('read-close', function () {
            var ix = selectors.indexOf(r);
            if (ix >= 0) selectors.splice(ix, 1);
        });
        
        r.on('_write-begin', function (stream) {
            tokens.pause();
            skipping = true;
            stream.pipe(through(write, end));
            stream.resume();
            
            function write (buf) {
                if (Buffer.isBuffer(buf)) {
                    tr.queue(buf)
                }
                else if (typeof buf === 'string') {
                    tr.queue(Buffer(buf));
                }
                else {
                    tr.queue(Buffer(String(buf)));
                }
            }
            function end () {
                tokens.resume();
            }
        });
        
        r.on('_write-end', function () {
            skipping = false;
        });
        
        selectors.push(r);
        return r;
    };
    
    tr.selectAll = function (sel, cb) {
        var r = new Result(sel);
        if (cb) r.on('element', cb);
        
        r._matcher.on('open', function (node) {
            node.getAttribute = function (name, cb) {
                r.getAttribute(name, function (value) {
                    delete r._getAttr[name.toUpperCase()];
                    cb.call(this, value);
                });
            };
            node.setAttribute = function (name, value) {
                r.setAttribute(name, value);
                r._matcher.on('attribute', function (node) {
                    if (node.name === name.toUpperCase()) {
                        delete r._setAttr[name.toUpperCase()];
                    }
                });
            };
            
            node.createReadStream = Result.prototype.createReadStream.bind(r);
            node.createWriteStream = Result.prototype.createWriteStream.bind(r);
            
            r.emit('element', node);
        });
        
        r.createReadStream = undefined;
        r.createWriteStream = undefined;
        
        selectors.push(r);
        return r;
    };
    
    return tr;
    
    function write (lex) {
        var sub;
        selectors.forEach(function (s) {
            s._at(lex);
            if (s._substitute !== undefined) {
                sub = s._substitute;
                s._substitute = undefined;
            }
        });
        
        if (skipping) return;
        
        if (sub !== undefined) tr.queue(sub)
        else tr.queue(lex[1])
    }
    
    function end () {
        tr.queue(null);
    }
};

inherits(Result, EventEmitter);

function Result (sel) {
    var self = this;
    self._setAttr = {};
    self._getAttr = {};
    self._readStreams = [];
    self._writeStream = null;
    
    self._reading = false;
    self._writing = false;
    self._matcher = matcher(parseSelector(sel));
    
    self._matcher.on('tag-end', function (m) {
        if (self._readStreams.length) {
            self._reading = true;
            self._readMatcher = m;
            self._readLevel = m.stack.length;
            
            for (var i = 0; i < self._readStreams.length; i++) {
                if (self._readStreams[i]._level === undefined) {
                    self._readStreams[i]._level = self._readLevel;
                }
            }
        }
        if (self._writeStream) {
            self._writing = true;
            self._writeLevel = m.stack.length;
            self.emit('_write-begin', self._writeStream);
        }
    });
    
    self._matcher.on('attribute', function (node) {
        var f = self._getAttr[node.name];
        if (f) f(node.value);
        var v = self._setAttr[node.name];
        if (v !== undefined) self._substitute = v;
    });
}

Result.prototype._at = function (lex) {
    if (this._reading) {
        if (lex[0] === 'closetag') {
            var level = this._matcher.matchers[0].stack.length;
            var removed = 0;
            
            for (var i = this._readStreams.length - 1; i >= 0; i--) {
                var s = this._readStreams[i];
                if (s._level === level) {
                    s.queue(null);
                    removed ++;
                    this._readStreams.splice(i, 1);
                }
            }
            if (this._readStreams.length === 0) {
                this._reading = false;
            }
            if (removed > 0) this.emit('read-close');
        }
        for (var i = 0; i < this._readStreams.length; i++) {
            var s = this._readStreams[i];
            if (s._level !== undefined) s.queue(lex[1]);
        }
    }
    if (this._writing) {
        if (lex[0] === 'closetag') {
            var level = this._matcher.matchers[0].stack.length;
            if (level === this._writeLevel) {
                this._writing = false;
                this.emit('_write-end');
            }
        }
    }
    this._matcher.at(lex[0], lex[2]);
};

Result.prototype.setAttribute = function (key, value) {
    var sub = Buffer(ent.encode(key) + '="' + ent.encode(value) + '"');
    this._setAttr[key.toUpperCase()] = sub;
    return this;
};

Result.prototype.getAttribute = function (key, cb) {
    this._getAttr[key.toUpperCase()] = cb;
};

Result.prototype.createWriteStream = function () {
    // doesn't work with selectAll()
    var stream = through().pause();
    this._writeStream = stream;
    return stream;
};

Result.prototype.createReadStream = function () {
    // doesn't work with selectAll()
    var stream = through();
    this._readStreams.push(stream);
    return stream;
};
