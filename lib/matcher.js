var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var SPECIAL = {
    'INPUT': true,
    // ...
};

module.exports = function (selector) {
    return new Match(selector);
};

function Match (selector) {
    this.selector = selector;
    this.pending = null;
    this.pendingCount = 0;
    this.index = 0;
    this.current = null;
    this.matched = false;
    this.startLevel = null;
    this.stack = [];
    this.operator = null;
}

inherits(Match, EventEmitter);

Match.prototype.next = function () {
    if (/^[>\+]$/.test(this.selector[this.index+1])) {
        this.operator = this.selector[++this.index];
    }
    else {
        this.operator = ' ';
    }
    
    if (++ this.index === this.selector.length) {
        this.emit('open', this.current);
        this.matched = true;
        //this.unmatch();
    }
};

Match.prototype.satisfied = function (name) {
    if (!this.pending[name]) return;
    this.pending[name] = null;
    if (-- this.pendingCount === 0) this.next();
};

Match.prototype.unmatch = function () {
    this.index = 0;
    this.pending = null;
    this.current = null;
    this.matched = false;
    this.startLevel = null;
};

Match.prototype.at = function (kind, node) {
    var sel = this.selector[this.index];
    if (kind === 'tag-begin' && !node.isSelfClosing
    && !SPECIAL[node.name]) {
        this.stack.push(node.name);
    }
    else if (kind === 'closetag') {
        for (var i = this.stack.length - 1; i >= 0; i--) {
            if (this.stack[i] === node) {
                this.stack.splice(i);
                break;
            }
        }
        if (this.operator === '+') {
            if (this.stack.length < this.startLevel) {
                this.unmatch();
            }
        }
        else if (this.stack.length <= this.startLevel) {
            this.unmatch();
        }
    }
    
    if (kind !== 'tag-begin') {
        if (this.matched) {
            if (kind === 'tag-close') {
                this.emit('open-complete', node);
            }
            else this.emit(kind, node);
            this.unmatch();
        }
        return;
    }
    
    var matched = sel.name === null || sel.name === '*'
        || node.name === sel.name
    ;
    if (matched && this.index === 0) {
        this.startLevel = this.stack.length;
    }
    
    if (this.operator === '>' && !matched) {
        return this.unmatch();
    }
    
    this.current = node;
    var p = this.pending = {
        class: sel.class.length && sel.class.slice(),
        id: sel.id,
        pseudo: sel.pseudo,
        exists: sel.attribute.exists,
        equals: sel.attribute.equals,
        contains: sel.attribute.contains,
        begins: sel.attribute.begins
    };
    var c = this.pendingCount = Boolean(p.class) + Boolean(p.id)
        + Boolean(p.pseudo) + Boolean(p.exists) + Boolean(p.equals)
        + Boolean(p.contains) + Boolean(p.begins)
    ;
    if (c === 0) this.next();
    
    if (p.class && node.attributes.CLASS) {
        var clist = this.pending.class;
        var classes = node.attributes.CLASS.split(/\s+/);
        for (var i = 0; i < classes.length; i++) {
            var ix = clist.indexOf(classes[i]);
            if (ix >= 0) {
                clist.splice(ix, 1);
                if (clist.length === 0) this.satisfied('class');
            }
        }
    }
    
    if (p.id && p.id === node.attributes.ID) {
        this.satisfied('id');
    }
    if (p.exists && node.attributes[p.exists.toUpperCase()] !== undefined) {
        this.satisfied('exists');
    }
    
    var x;
    if (p.equals && (x = node.attributes[p.equals[0].toUpperCase()])) {
        if (x === p.equals[1]) {
            this.satisfied('equals');
        }
    }
    if (p.contains && (x = node.attributes[p.contains[0].toUpperCase()])) {
        if (x.split(/\s+/).indexOf(p.contains[1]) >= 0) {
            this.satisfied('contains');
        }
    }
    if (p.begins && (x = node.attributes[p.begins[0].toUpperCase()])) {
        if (x.split('-')[0] === p.begins[1]) {
            this.satisfied('begins');
        }
    }
};
