# node-trumpet2

[![NPM version](https://img.shields.io/npm/v/node-trumpet2.svg)](https://www.npmjs.com/package/node-trumpet2)
[![Actions Status](https://github.com/gofunky/node-trumpet2/workflows/build/badge.svg)](https://github.com/gofunky/node-trumpet2/actions)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-purple.svg)](https://standardjs.com)
[![CodeFactor](https://www.codefactor.io/repository/github/gofunky/node-trumpet2/badge)](https://www.codefactor.io/repository/github/gofunky/node-trumpet2)
[![codecov](https://codecov.io/gh/gofunky/node-trumpet2/branch/master/graph/badge.svg)](https://codecov.io/gh/gofunky/node-trumpet2)
[![NPM Downloads](https://img.shields.io/npm/dm/node-trumpet2)](https://www.npmjs.com/package/node-trumpet2)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=gofunky/node-trumpet2)](https://dependabot.com)
[![GitHub License](https://img.shields.io/github/license/gofunky/node-trumpet2.svg)](https://github.com/gofunky/node-trumpet2/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/gofunky/node-trumpet2.svg)](https://github.com/gofunky/node-trumpet2/commits/master)

the maintained version of [trumpet](https://github.com/substack/node-trumpet)

## Install

With [npm](http://npmjs.org) do:

    npm install node-trumpet2

## Examples

### Replace inner

input html:

```html
<table>
  <tbody>blah blah blah</tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

code:

```js
const trumpet = require('node-trumpet2');
const tr = trumpet();
tr.pipe(process.stdout);
 
const ws = tr.select('tbody').createWriteStream();
ws.end('<tr><td>rawr</td></tr>');

const fs = require('fs');
fs.createReadStream(__dirname + '/html/table.html').pipe(tr);
```

output:

```html
<table>
  <tbody><tr><td>rawr</td></tr></tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

### Read all

Input html:

```html
<html>
  <head>
    <title>beep</title>
  </head>
  <body>
    <div class="a">¡¡¡</div>
    <div class="b">
      <span>tacos</span>
      <span> y </span>
      <span>burritos</span>
    </div>
    <div class="a">!!!</div>
  </body>
</html>
```

code:

```js
const trumpet = require('node-trumpet2');
const tr = trumpet();

tr.selectAll('.b span', function (span) {
    span.createReadStream().pipe(process.stdout);
});

const fs = require('fs');
fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr);
```

output:

```html
tacos y burritos
```

### Read, modify, and write

input html:

```html
<html>
  <body>
    <div class="x">
      <span>hack</span>
      <span> the </span>
      <span>planet</span>
    </div>
  </body>
</html>
```

code:

```js
const trumpet = require('node-trumpet2');
const through = require('through2');

const tr = trumpet();

//select all element and apply transformation function to selections
tr.selectAll('.x span', function (element) {
    //define function to transform input
    const upper = through(function (buf) {
        this.queue(buf.toString().toUpperCase());
    });

    //create a read/write stream for selected selement
    const estream = element.createStream();

    //stream the element's inner html to transformation function
    //then stream the transformed output back into the element stream
    estream.pipe(upper).pipe(estream);
});

//stream in html to trumpet and stream processed output to stdout
const fs = require('fs');
fs.createReadStream(__dirname + '/html/uppercase.html').pipe(tr).pipe(process.stdout);
```

output:

```html
<html>
  <body>
    <div class="x">
      <span>HACK</span>
      <span> THE </span>
      <span>PLANET</span>
    </div>
  </body>
</html>
```

## Methods

```js
const trumpet = require('node-trumpet2')
```

### const tr = trumpet(opts)

Create a new trumpet stream. This stream is readable and writable.
Pipe an html stream into `tr` and get back a transformed html stream.

Parse errors are emitted by `tr` in an `'error'` event.

### const elem = tr.select(selector)

Return a result object `elem` for the first element matching `selector`.

### tr.selectAll(selector, function (elem) {})

Get a result object `elem` for every element matching `selector`.

### elem.getAttribute(name, cb)

When the selector for `elem` matches, query the case-insensitive attribute
called `name` with `cb(value)`.

Returns `elem`.

### elem.getAttributes(name, cb)

Get all the elements in `cb(attributes)` as an object `attributes` with
lower-case keys.

Returns `elem`.

### elem.setAttribute(name, value)

When the selector for `elem` matches, replace the case-insensitive attribute
called `name` with `value`.

If the attribute doesn't exist, it will be created in the output stream.

Returns `elem`.

### elem.removeAttribute(name)

When the selector for `elem` matches, remove the attribute called `name` if it
exists.

Returns `elem`.

### elem.createReadStream(opts)

Create a new readable stream with the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### elem.createWriteStream(opts)

Create a new write stream to replace the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### elem.createStream(opts)

Create a new readable writable stream that outputs the content under `elem` and
replaces the content with the data written to it.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### tr.createStream(sel, opts)

Short-hand for `tr.select(sel).createStream(opts)`.

### tr.createReadStream(sel, opts)

Short-hand for `tr.select(sel).createReadStream(opts)`.

### tr.createWriteStream(sel, opts)

Short-hand for `tr.select(sel).createWriteStream(opts)`.

## Attributes

### elem.name

The element name as a lower-case string. For example: `'div'`.

## Selector syntax

Currently, these [css selectors](http://www.w3.org/TR/CSS2/selector.html) work:

-   \-
-   E
-   E F
-   E > F
-   E + F
-   E.class
-   E#id
-   E[attr=value]
-   E[attr~=search]
-   E[attr|=prefix]
-   E[attr^=prefix]
-   E[attr$=suffix]
-   E[attr*=search]
