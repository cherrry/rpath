# rpath

Recursive path traversal

## Install

```
$ npm install --save rpath
```

## Usage

```js
var rpath = require('rpath');

var allPaths = rpath.sync('/path/to/rpath', false);
console.log(allPaths);

rpath('/path/to/rpath', false, function (allPaths) {
    console.log(allPaths);
});
```
