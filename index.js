var sax = require('sax');
var through = require('through');
var throughout = require('throughout');

module.exports = function (opts) {
    var output = through();
    var parser = sax.createStream(false);
    
    parser.on('opentag', function (tag) {
    });
    
    parser.on('attribute', function (attribute) {
    });
    
    parser.on('opencdata', function (attribute) {
    });
    
    parser.on('closecdata', function (attribute) {
    });
    
    parser.on('closetag', function (tag) {
    });
    
    parser.on('script', function (script) {
    });
    
    parser.on('comment', function (comment) {
    });
    
    parser.on('text', function (text) {
    });
    
    return throughout(parser, output);
    
    if (!opts) opts = {};
    
    var stream = select(parser, opts, write, end);
    
    function write (buf) {
        var s = buf.toString();
        buffered += s;
        parser.write(buf.toString());
    }
    
    function end () {
        if (pos < parser.position) {
            var s = buffered.slice(0, parser.position - pos);
            stream.raw(s);
        }
        stream.queue(null);
    }
    
    parser.onerror = function (err) {
        stream.emit("error", err)
    }
    
    var buffered = '';
    var pos = 0;
    var inScript = false;
    var scriptLen = 0;
    var scriptStart = 0;
    
    var update = function (type, tag) {
        var len, src;
        if (type === 'script') {
            src = tag;
            len = tag.length;
            scriptLen += len;
            inScript = true;
        }
        else if (type === 'text') {
            len = parser.textNode.length;
        }
        else if (type === 'open' && tag && tag.name === 'SCRIPT'
        && tag.attributes.src) {
            len = 0;
        }
        else if (inScript) {
            len = parser.position - scriptLen - parser.startTagPosition + 1;
            scriptLen = 0;
            inScript = false;
        }
        else if (type === 'special') {
            len = 0;
        }
        else {
            len = parser.position - parser.startTagPosition + 1;
        }
        
        if (type === 'open' && tag && tag.name === 'SCRIPT') {
            scriptLen = len;
        }
        
        pos = parser.position;
        
        src = src || buffered.slice(0, len);
        buffered = buffered.slice(len);
        
        stream.raw(src);
        return src;
    };
    
    var lastOpen;
    parser.onopentag = function (tag) {
        lastOpen = tag.name;
        
        stream.pre('open', tag);
        update('open', tag);
        stream.post('open', tag);
        if (!tag.isSelfClosing) {
            stream.pre('close', tag.name);
            update('special');
            stream.post('close', tag.name);
        }
    };
    
    parser.oncomment = function(comment) {
        src = buffered.slice(0, comment.length + 7)
        buffered = buffered.slice(comment.length + 7)
        stream.raw(src)
    };
    
    parser.onclosetag = function (name) {
        stream.pre('close', name);
        update('close');
        stream.post('close', name);
    };
    
    parser.ontext = function (text) {
        stream.pre('text', text);
        update('text');
        stream.post('text', text);
    };
    
    parser.onscript = function (src) {
        stream.pre('script', src);
        update('script', src);
        stream.post('script', src);
    };
    
    parser.onattribute = function (attr) {
        stream.pre('attribute', attr);
        update('attribute');
        stream.post('attribute', attr);
    };
    
    return stream;
};
