# trumpet

[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/gofunky/trumpet/build/master?style=for-the-badge)](https://github.com/gofunky/trumpet/actions)
[![Codecov](https://img.shields.io/codecov/c/github/gofunky/trumpet?style=for-the-badge)](https://codecov.io/gh/gofunky/trumpet)
[![Renovate Status](https://img.shields.io/badge/renovate-enabled-green?style=for-the-badge&logo=renovatebot&color=1a1f6c)](https://app.renovatebot.com/dashboard#github/gofunky/trumpet)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/@gofunky%2Ftrumpet?style=for-the-badge)](https://libraries.io/npm/@gofunky%2Ftrumpet)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@gofunky/trumpet?style=for-the-badge)](https://snyk.io/test/github/gofunky/trumpet)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-purple.svg?style=for-the-badge)](https://standardjs.com)
[![CodeFactor](https://www.codefactor.io/repository/github/gofunky/trumpet/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/gofunky/trumpet)
[![node-current](https://img.shields.io/node/v/@gofunky/trumpet?style=for-the-badge)](https://www.npmjs.com/package/@gofunky/trumpet)
[![NPM version](https://img.shields.io/npm/v/@gofunky/trumpet?style=for-the-badge)](https://www.npmjs.com/package/@gofunky/trumpet)
[![NPM Downloads](https://img.shields.io/npm/dm/@gofunky/trumpet?style=for-the-badge&color=ff69b4)](https://www.npmjs.com/package/@gofunky/trumpet)
[![GitHub License](https://img.shields.io/github/license/gofunky/trumpet.svg?style=for-the-badge)](https://github.com/gofunky/trumpet/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/gofunky/trumpet.svg?style=for-the-badge&color=9cf)](https://github.com/gofunky/trumpet/commits/master)

the maintained version of [trumpet](https://github.com/substack/node-trumpet)

## Examples

### Replace inner

#### Input HTML

```html
<table>
  <tbody>blah blah blah</tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

#### Code

```js
const trumpet = require('@gofunky/trumpet')
const tr = trumpet()
tr.pipe(process.stdout)
 
const ws = tr.select('tbody').createWriteStream()
ws.end('<tr><td>rawr</td></tr>')

const fs = require('fs')
fs.createReadStream(__dirname + '/html/table.html').pipe(tr)
```

#### Output

```html
<table>
  <tbody><tr><td>rawr</td></tr></tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

### Read all

#### Input HTML

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

#### Code

```js
const trumpet = require('@gofunky/trumpet')
const tr = trumpet()

tr.selectAll('.b span', (span) => {
  span.createReadStream().pipe(process.stdout)
})

const fs = require('fs')
fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr)
```

#### Output

```html
tacos y burritos
```

### Read, modify, and write

#### Input HTML

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

#### Code

```js
const trumpet = require('@gofunky/trumpet')
const through = require('through2')

const tr = trumpet()

//select all element and apply transformation function to selections
tr.selectAll('.x span', (element) => {
 
    //define function to transform input
    const upper = through((buf) => {
      this.queue(String(buf).toUpperCase())
    })
    
    //create a read/write stream for selected selement
    const stream = element.createStream()
    
    //stream the element's inner html to transformation function
    //then stream the transformed output back into the element stream
    stream.pipe(upper).pipe(stream)
})

//stream in html to trumpet and stream processed output to stdout
const fs = require('fs')
fs.createReadStream(__dirname + '/html/uppercase.html').pipe(tr).pipe(process.stdout)
```

#### Output

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
const trumpet = require('@gofunky/trumpet')
```

### `const tr = trumpet(opts)`

Create a new trumpet stream. This stream is readable and writable.
Pipe an html stream into `tr` and get back a transformed html stream.

Parse errors are emitted by `tr` in an `'error'` event.

### `const elem = tr.select(selector)`

Return a result object `elem` for the first element matching `selector`.

### `tr.selectAll(selector, (elem) => {})`

Get a result object `elem` for every element matching `selector`.

### `elem.getAttribute(name, cb)`

When the selector for `elem` matches, query the case-insensitive attribute
called `name` with `cb(value)`.

Returns `elem`.

### `elem.getAttributes(name, cb)`

Get all the elements in `cb(attributes)` as an object `attributes` with
lower-case keys.

Returns `elem`.

### `elem.setAttribute(name, value)`

When the selector for `elem` matches, replace the case-insensitive attribute
called `name` with `value`.

If the attribute doesn't exist, it will be created in the output stream.

Returns `elem`.

### `elem.removeAttribute(name)`

When the selector for `elem` matches, remove the attribute called `name` if it
exists.

Returns `elem`.

### `elem.createReadStream(opts)`

Create a new readable stream with the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### `elem.createWriteStream(opts)`

Create a new write stream to replace the inner html content under `elem`.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### `elem.createStream(opts)`

Create a new readable writable stream that outputs the content under `elem` and
replaces the content with the data written to it.

To use the outer html content instead of the inner, set `opts.outer` to `true`.

### `tr.createStream(sel, opts)`

Short-hand for `tr.select(sel).createStream(opts)`.

### `tr.createReadStream(sel, opts)`

Short-hand for `tr.select(sel).createReadStream(opts)`.

### `tr.createWriteStream(sel, opts)`

Short-hand for `tr.select(sel).createWriteStream(opts)`.

## Attributes

### `elem.name`

The element name as a lower-case string. For example: `'div'`.

## Selector syntax

Currently, these [css selectors](http://www.w3.org/TR/CSS2/selector.html) work:

-   `*`
-   `E`
-   `E F`
-   `E > F`
-   `E + F`
-   `E.class`
-   `E#id`
-   `E[attr=value]`
-   `E[attr~=search]`
-   `E[attr|=prefix]`
-   `E[attr^=prefix]`
-   `E[attr$=suffix]`
-   `E[attr*=search]`
