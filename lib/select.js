var Stream = require('stream').Stream;

module.exports = function () {
    var stream = new Stream;
    stream.writable = true;
    stream.readable = true;
    return stream;
};
