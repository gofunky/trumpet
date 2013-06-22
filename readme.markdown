# trumpet

parse and transform streaming html using css selectors

[![build status](https://secure.travis-ci.org/substack/node-trumpet.png)](http://travis-ci.org/substack/node-trumpet)

![trumpet](http://substack.net/images/trumpet.png)

# example

## table

input html:

``` html
<table>
  <tbody>blah blah blah</tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

``` js
var trumpet = require('trumpet');
var tr = trumpet();
tr.pipe(process.stdout);
 
var ws = tr.select('tbody').createWriteStream();
ws.end('<tr><td>rawr</td></tr>');

var fs = require('fs');
fs.createReadStream(__dirname + '/html/table.html').pipe(tr);
```

output:

``` html
<table>
  <tbody><tr><td>rawr</td></tr></tbody>
  <tr><td>there</td></tr>
  <tr><td>it</td></tr>
  <tr><td>is</td></tr>
</table>
```

## read all

input html:

``` html
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

``` js
var trumpet = require('trumpet');
var tr = trumpet();

tr.selectAll('.b span', function (span) {
    span.createReadStream().pipe(process.stdout);
});

var fs = require('fs');
fs.createReadStream(__dirname + '/html/read_all.html').pipe(tr);
```

output:

``` html
tacos y burritos
```

# methods

``` js
var trumpet = require('trumpet')
```

## var tr = trumpet(opts)

Create a new trumpet stream. This stream is readable and writable.
Pipe an html stream into `tr` and get back a transformed html stream.

Parse errors are emitted by `tr` in an `'error'` event.

## var elem = tr.select(selector)

Return a result object `elem` for the first element matching `selector`.

## tr.selectAll(selector, function (elem) {})

Get a result object `elem` for every element matching `selector`.

## elem.getAttribute(name, cb)

When the selector for `elem` matches, query the case-insensitive attribute
called `name` with `cb(value)`.

## elem.setAttribute(name, value)

When the selector for `elem` matches, replace the case-insensitive attribute
called `name` with `value`.

If the attribute doesn't exist, it will be created in the output stream.

## elem.createReadStream()

Create a new readable stream with the inner html content under `elem`.

## elem.createWriteStream()

Create a new write stream to replace the inner html content under `elem`.

## elem.createStream()

Create a new readable writable stream that outputs the content under `elem` and
replaces the content with the data written to it.

# selector syntax

Presently these [css selectors](http://www.w3.org/TR/CSS2/selector.html) work:

* *
* E
* E F
* E > F
* E + F
* E.class
* E#id
* E[attr=value]

# install

With [npm](http://npmjs.org) do:

```
npm install trumpet
```

# license

MIT
