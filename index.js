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
    tokens.pipe(through(write, end));
    
    var tr = through(
        function (buf) { tokens.write(buf) },
        function () { tokens.end() }
    );
    
    tr.select = function (sel) {
        var r = new Result(sel);
        r._matcher.once('unmatch', function () {
            if (!r._writing) {
                var ix = selectors.indexOf(r);
                if (ix >= 0) selectors.splice(ix, 1);
            }
        });
        r.once('read-close', function () {
            var ix = selectors.indexOf(r);
            if (ix >= 0) selectors.splice(ix, 1);
        });
        selectors.push(r);
        return r;
    };
    
    tr.selectAll = function (sel) {
        var r = new Result(sel);
        r.createReadStream = undefined;
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
    
    self._writing = false;
    self._matcher = matcher(parseSelector(sel));
    
    self._matcher.on('tag-end', function (m) {
        var rsl = self.listeners('read-stream');
        if (self._readStreams.length || rsl.length) {
            self._writing = true;
            self._readMatcher = m;
            self._readLevel = m.stack.length;
            
            for (var i = 0; i < rsl.length; i++) {
                var stream = through();
                rsl[i](stream);
                self._readStreams.push(stream);
            }
            for (var i = 0; i < self._readStreams.length; i++) {
                if (self._readStreams[i]._readLevel === undefined) {
                    self._readStreams[i]._readLevel = self._readLevel;
                }
            }
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
    if (this._writing) {
        if (lex[0] === 'closetag') {
            var level = this._matcher.matchers[0].stack.length;
            var removed = 0;
            
            for (var i = this._readStreams.length - 1; i >= 0; i--) {
                var s = this._readStreams[i];
                if (s._readLevel === level) {
                    s.queue(null);
                    removed ++;
                    this._readStreams.splice(i, 1);
                    i --;
                }
            }
            if (this._readStreams.length === 0) {
                this._writing = false;
            }
            if (removed > 0) this.emit('read-close');
        }
        for (var i = 0; i < this._readStreams.length; i++) {
            this._readStreams[i].queue(lex[1]);
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
};

Result.prototype.createReadStream = function () {
    // doesn't work with selectAll()
    var stream = through();
    this._readStreams.push(stream);
    return stream;
};
