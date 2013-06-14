module.exports = function (selector) {
    return new Match(selector);
};

function Match (selector) {
    this.selector = selector;
    this.pending = null;
    this.pendingCount = 0;
    this.index = 0;
}

Match.prototype.next = function () {
    if (++ this.index === this.selector.length) {
        console.log('MATCHED!');
        this.index = 0;
        this.pending = null;
    }
};

Match.prototype.satisfied = function (name) {
    if (!this.pending[name]) return;
    this.pending[name] = null;
    if (-- this.pendingCount === 0) this.next();
};

Match.prototype.at = function (kind, node) {
    var sel = this.selector[this.index];
    
    if (kind === 'tag-begin') {
        var matched = sel.name === null || sel.name === '*'
            || node.name === sel.name
        ;
        if (!matched) {
            this.index = 0;
            this.pending = null;
            return;
        }
        
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
    }
    else if (kind === 'attribute' && node.name === 'CLASS'
    && this.pending.class) {
        var clist = this.pending.class;
        var ix = clist.indexOf(node.value);
        if (ix >= 0) {
            clist.splice(ix, 1);
            if (clist.length === 0) this.satisfied('class');
        }
    }
};
