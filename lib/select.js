var Stream = require('stream').Stream;

module.exports = function (parser) {
    var stream = new Stream;
    stream.writable = true;
    stream.readable = true;
    
    var selectors = [];
    
    stream.select = function (s, fn) {
        var sel = createSelector(s, fn);
        selectors.push(sel);
        return stream;
    };
    
    var updating = false;
    
    stream.pre = function (name, t) {
        if (name === 'open') {
        }
        else if (name === 'close') {
            selectors.forEach(function (sel) {
                var up = sel.updating;
                
                sel.pending = sel.pending.filter(function (p) {
                    var done = p.level > parser.tags.length;
                    if (done) p.callback.call(stream, p.buffered);
                    return !done;
                });
                
                if (up && !sel.updating) updating = false;
            });
        }
    };
    
    stream.post = function (name, t) {
        if (name === 'open') {
            selectors.forEach(function (sel) {
                sel(t, parser)
                if (sel.updating) updating = true;
            });
        }
    };
    
    stream.raw = function (s) {
        selectors.forEach(function (sel) {
            sel.pending.forEach(function (p) {
                p.buffered += s;
            });
        });
        
        if (!updating) stream.emit('data', s);
    };
    
    return stream;
};

function createSelector (selector, fn) {
    var parts = selector.split(/([\s>+]+)/).map(function (s) {
        if (s.match(/^\s+$/)) return;
        var op = s.trim();
        if (op === '>' || op === '+') return { combinator : op };
        
        var m = {
            name : s.match(/^([\w-]+|\*)/),
            class : s.match(/\.([\w-]+)/),
            id : s.match(/#([\w-]+)/),
            pseudo : s.match(/:([\w-]+)/),
            attribute : s.match(/\[([^\]]+)\]/),
        };
        
        return {
            name : m.name && m.name[1].toUpperCase(),
            class : m.class && m.class[1],
            id : m.id && m.id[1],
            pseudo : m.pseudo && m.pseudo[1],
            attribute : m.attribute && m.attribute[1],
        };
    }).filter(Boolean);
    
    var depth = parts.reduce(function (sum, s) {
        return sum + (s.combinator ? 0 : 1);
    }, 0);
    
    var sel = function (tag, parser) {
        var tags = parser.tags;
        if (depth > tags.length) return;
        
        // hypothesis: the selector matches
        var j = parts.length - 1;
        var i = tags.length - 1;
        
        for (; j >= 0; j--, i--) {
            var t = tags[i];
            var p = parts[j];
            
            // try to falsify the hypothesis on each tag/part match:
            if (p.name && p.name !== t.name) return;
            if (p.class && p.class !== t.attributes.class) return;
            if (p.id && p.id !== t.attributes.id) return;
        }
        
        var p = { level : tags.length };
        var expired = false;
        function expire () {
            throw new Error('Parse expired. You had your chance.');
        }
        
        fn({
            name : tag.name.toLowerCase(),
            attributes : tag.attributes,
            html : function (cb) {
                if (expired) expire();
                
                p.buffered = '';
                p.callback = cb;
                sel.pending.push(p);
            },
            update : function (cb) {
                if (expired) expire();
                
                p.buffered = '';
                p.callback = function (html) {
                    this.emit('data',
                        typeof cb === 'function' ? cb(html) : cb
                    );
                    sel.updating = false;
                };
                sel.updating = true;
                sel.pending.push(p);
            },
            remove : function () {
                if (expired) expire();
                sel.updating = true;
                p.callback = function () {
                    sel.updating = false;
                };
                sel.pending.push(p);
            },
        });
        
        expired = true;
    };
    
    sel.pending = [];
    
    return sel;
}
