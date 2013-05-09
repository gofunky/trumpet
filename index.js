var sax = require('sax');
var select = require('./lib/select');

module.exports = function (opts) {
    if (!opts) opts = {};
    if (!opts.special) {
        opts.special = [
            'area', 'base', 'basefont', 'br', 'col',
            'hr', 'input', 'img', 'link', 'meta'
        ];
    }
    opts.special = opts.special.map(function (x) { return x.toUpperCase() });
    
    var parser = sax.parser(false);
    var stream = select(parser, opts);

    parser.onerror = function (err) {
        stream.emit("error", err)
    }
    
    function write (buf) {
        stream.emit('data', buf);
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
            len = parser.startTagPosition - pos - 1;
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
    
    stream.write = function (buf) {
        var s = buf.toString();
        buffered += s;
        parser.write(buf.toString());
    };
    
    stream.end = function (buf) {
        if (buf !== undefined) stream.write(buf);
        
        if (pos < parser.position) {
            var s = buffered.slice(0, parser.position - pos);
            stream.raw(s);
        }
        stream.emit('end');
    };
    
    parser.onopentag = function (tag) {
        stream.pre('open', tag);
        update('open', tag);
        stream.post('open', tag);
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
    
    return stream;
};
