# ol-util

[![Build Status](https://travis-ci.org/terrestris/ol-util.svg?branch=master)](https://travis-ci.org/terrestris/ol-util)
[![Coverage Status](https://coveralls.io/repos/github/terrestris/ol-util/badge.svg?branch=master)](https://coveralls.io/github/terrestris/ol-util?branch=master)

A set of helper classes for working with OpenLayers

## Installation

```javascript static
npm i @terrestris/ol-util
```

## API Documentation

* Latest: [https://terrestris.github.io/ol-util/latest/index.html](https://terrestris.github.io/ol-util/latest/index.html)
* Docs for other versions are available via the following format:
  * v3.0.0 [https://terrestris.github.io/ol-util/3.0.0/index.html](https://terrestris.github.io/ol-util/3.0.0/index.html)

## Development

`npm run watch:buildto` can be used to inject an updated version of `ol-util` into antother project. The script will also watch for further changes. Example usage for [react-geo](https://github.com/terrestris/react-geo):

```sh
npm run watch:buildto ../react-geo/node_modules/@terrestris/ol-util
```
