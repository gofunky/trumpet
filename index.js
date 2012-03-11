var sax = require('sax');
var Stream = require('stream').Stream;

module.exports = function (fn) {
    var parser = sax.parser(false);
    var stream = new Stream;
    
    stream.writable = true;
    stream.readable = true;
    
    var buffered = '';
    var pos = 0;
    var update = function (type) {
        if (type === 'text') {
            var len = parser.startTagPosition - pos - 1;
        }
        else {
            var len = parser.position - parser.startTagPosition + 1;
        }
        pos = parser.position;
        
        var src = buffered.slice(0, len);
        buffered = buffered.slice(len);
        
        if (fn) fn({
            type : type,
            source : src,
            parser : parser,
            write : function (buf) {
                stream.emit('data', buf);
            },
        });
    };
    
    stream.write = function (buf) {
        var s = buf.toString();
        buffered += s;
        parser.write(buf.toString());
    };
    
    stream.end = function (buf) {
        if (buf !== undefined) stream.write(buf);
        stream.emit('end');
    };
    
    parser.onopentag = function () {
        update('open');
    };
    
    parser.onclosetag = function () {
        update('close');
    };
    
    parser.ontext = function () {
        update('text');
    };
    
    return stream;
};
