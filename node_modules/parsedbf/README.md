parseDBF
========
DBF parsing components of [shapefile-js](https://github.com/calvinmetcalf/shapefile-js)

[![Build Status](https://travis-ci.org/calvinmetcalf/parseDBF.svg)](https://travis-ci.org/calvinmetcalf/parseDBF)
[![Dependency Status](https://david-dm.org/calvinmetcalf/parseDBF.svg)](https://david-dm.org/calvinmetcalf/parseDBF)
[![devDependency Status](https://david-dm.org/calvinmetcalf/parseDBF/dev-status.svg)](https://david-dm.org/calvinmetcalf/parseDBF#info=devDependencies)


Install
===

```
npm install --save parsedbf
```

Usage
===

`parseDBF(buffer, [codepage])`

```js
var parseDBF = require('parsedbf');

var dbfFile = fs.readFileSync('path/to/my/file');
var parsedDBF = parseDBF(dbfFile);
```
