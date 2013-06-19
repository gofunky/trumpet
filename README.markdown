# trumpet

parse and transform streaming html using css selectors

[![build status](https://secure.travis-ci.org/substack/node-trumpet.png)](http://travis-ci.org/substack/node-trumpet)

![trumpet](http://substack.net/images/trumpet.png)

# example


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
