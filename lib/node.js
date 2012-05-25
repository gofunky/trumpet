module.exports = function (tag, sel, level) {
    return new Node(tag, sel, level);
};

function expire () {
    throw new Error('Parse expired. You had your chance.');
}

function Node (tag, sel, level) {
    this.name = tag.name.toLowerCase();
    this.attributes = tag.attributes;
    this.p = { level : level };
    
    this.tag = tag;
    this.sel = sel;
}

Node.prototype.html = function (cb) {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    
    p.buffered = '';
    p.callback = cb;
    p.writes = 0;
    sel.pending.push(p);
};

Node.prototype.update = function (cb, attrs) {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    
    p.buffered = '';
    p.callback = function (html) {
        this.emit('data',
            typeof cb === 'function' ? cb(html) : cb
        );
        sel.updating = false;
    };
    p.writes = 0;
    sel.updating = true;
    sel.pending.push(p);
};

Node.prototype.replace = function (cb) {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    
    p.buffered = '';
    p.callback = function (html) {
        this.emit('data',
            typeof cb === 'function' ? cb(html) : cb
        );
        sel.updating = false;
    };
    sel.updating = true;
    sel.removing = true;
    sel.pending.push(p);
};

Node.prototype.remove = function () {
    var p = this.p, sel = this.sel;
    if (this.expired) expire();
    sel.updating = true;
    sel.removing = true;
    p.callback = function () {
        sel.updating = false;
    };
    sel.pending.push(p);
};
