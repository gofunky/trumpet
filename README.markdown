trumpet
=======

Parse and transform streaming html using css selectors.

![trumpet](http://substack.net/images/trumpet.png)

example
=======

select
------

``` js
var transit = require('trumpet');
var tr = transit();

tr.select('.b span', function (node) {
    node.html(function (html) {
        console.log(node.name + ': ' + html);
    });
});

var fs = require('fs');
fs.createReadStream(__dirname + '/select.html').pipe(tr);
```

``` html
<html>
  <head>
    <title>beep</title>
  </head>
  <body>
    <div class="a">¡¡¡</div>
    <div class="b">
      <span>tacos</span>
      <span>y</span>
      <span>burritos</span>
    </div>
    <div class="a">!!!</div>
  </body>
</html>
```

output:

```
$ node example/select.js 
span: tacos
span: y
span: burritos
```

methods
=======

var trumpet = require('trumpet')

var tr = trumpet(fn)
--------------------

Create a new trumpet stream. This stream is readable and writable.
Pipe an html stream into `tr` and get back a transformed html stream.

Optionally supply a function `fn(node)` that will get raw parsing events.

`node` is an object with these keys:

* type - 'open', 'close', or 'text'
* source - source string of the present parse event from the input stream
* name - name of the html element (div, span, ...)
* attributes - attributes from the html element
* write(s) - write text to the output stream
* parser - the raw [sax](https://github.com/isaacs/sax-js) parser object

These nodes are different from the higher-level nodes you get with `.select()`.

tr.select(selector, fn)
-----------------------

Fire `fn(node)` for every element in the html stream that matches the css
`selector`.

The nodes are described in the nodes section of this document.

nodes
=====

node.name
---------

The name of the html element node, such as `'div'` or `'span'`.

node.attributes
---------------

An object with all the html attributes.

For example,

``` html
<img src="/beep.png" width="32" height="32">
```

has an attribute object of:

``` js
{ src : 'beep.png', width : '32', height : '32' }
```

node.html(cb)
-------------

Get the inner text and html for the element, which may not have arrived yet.

`cb(text)` fires when the inner contents are ready.

install
=======

With [npm](http://npmjs.org) do:

```
npm install trumpet
```

license
=======

MIT/X11
