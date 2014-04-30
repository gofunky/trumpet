var select = require('html-select');
var Writable = require('readable-stream').Writable;
var Readable = require('readable-stream').Readable;
var Duplex = require('readable-stream').Duplex;

module.exports = Selector;

function Selector (str) {
    if (!(this instanceof Selector)) return new Selector(str);
    var self = this;
    this._select = select(str, function (tag) {
        console.log('MATCHED', tag);
    });
}

Selector.prototype._push = function (token) {
    this._select.write(token);
};

Selector.prototype.createWriteStream = function () {
    return new Writable;
};

Selector.prototype.createReadStream = function () {
    var r = new Readable;
    r._read = function (n) {};
    return r;
};

Selector.prototype.createStream = function () {
    return new Duplex;
};
