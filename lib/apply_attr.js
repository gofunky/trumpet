module.exports = function (attrs, tag, buf) {
    var parts = [];
    var keys = Object.keys(tag.attributes);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!has(attrs, key)) {
            parts.push(key + '=' + quote(tag.attributes[key]));
        }
        else if (attrs[key] === undefined) {}
        else if (attrs[key] === true) {
            parts.push(key);
        }
        else {
            parts.push(key + '=' + quote(attrs[key]));
            delete attrs[key];
        }
    }
    
    var keys = Object.keys(attrs);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (attrs[key] === true) {
            parts.push(key);
        }
        else if (attrs[key] !== undefined) {
            parts.push(key + '=' + quote(attrs[key]));
        }
    }
    
    var before = buf.toString('utf8').split(/[\s>]/)[0];
    if (parts.length) before += ' ';
    return Buffer(before + parts.join(' ') + '>');
};

function quote (s) {
    var s_ = s.replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    ;
    return '"' + s_ + '"';
}
