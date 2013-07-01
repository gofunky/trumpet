var through = require('through');
var tokenize = require('./lib/tokenize.js');
var parseSelector = require('./lib/selector.js');
var matcher = require('./lib/matcher.js');
var ent = require('ent');
var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var duplexer = require('duplexer');

module.exports = function (opts) {
    var selectors = [];
    var tokens = tokenize();
    var tokenBuffer = null;
    var skipping = false;
    var lastToken = null;
    
    tokens.pipe(through(write, end));
    
    var tr = through(
        function (buf) { tokens.write(buf) },
        function () { tokens.end() }
    );
    
    tr.select = function (sel) {
        var r = createResult(sel, { all: false });
        return r;
    };
    
    tr.selectAll = function (sel, cb) {
        var r = createResult(sel, { all: true });
        
        r._matcher.on('open', function (node) {
            r.name = node.name;
            r.attributes = node.attributes;
            r.isSelfClosing = node.isSelfClosing;
            cb(r);
        });
        
        r._matcher.on('tag-end', function (node) {
            r._getAttr = {};
            r._setAttr = {};
        });
    };
    
    return tr;
    
    function createResult (sel, opts) {
        var r = new Result(sel);
        
        if (opts.all === false) {
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
        }
        
        r.on('_write-begin', function (stream) {
            if (lastToken[0] === 'tag-end'
            && lastToken[1].length > 0
            && '>' === String.fromCharCode(lastToken[1][lastToken[1].length-1])
            ) {
                tr.queue(lastToken[1]);
            }
            
            if (stream._skipping !== false) {
                tokens.pause();
            }
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
                if (stream._skipping !== false) {
                    tokens.resume();
                }
            }
        });
        
        r.on('_write-end', function () {
            skipping = false;
        });
        
        r.on('queue', function (buf) { tr.queue(buf) });
        
        selectors.push(r);
        return r;
    }
    
    function write (lex) {
        lastToken = lex;
        
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
    
    var remainingSets = [];
    self._matcher.on('open', function () {
        remainingSets = Object.keys(self._setAttr);
    });
    
    self._matcher.on('tag-end', function (m) {
        for (var i = 0; i < remainingSets.length; i++) {
            var key = remainingSets[i];
            self.emit('queue', Buffer(' ' + self._setAttr[key]));
        }
        
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
        if (v !== undefined) {
            self._substitute = v;
            var ix = remainingSets.indexOf(node.name);
            if (ix >= 0) remainingSets.splice(ix, 1);
        }
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

Result.prototype.createStream = function () {
    var ws = Result.prototype.createWriteStream.call(this);
    ws._skipping = false;
    var rs = Result.prototype.createReadStream.call(this);
    return duplexer(ws, rs);
};
