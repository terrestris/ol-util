# ol-util

[![npm version](https://img.shields.io/npm/v/@terrestris/ol-util.svg?style=flat-square)](https://www.npmjs.com/package/@terrestris/ol-util)
[![GitHub license](https://img.shields.io/github/license/terrestris/ol-util?style=flat-square)](https://github.com/terrestris/ol-util/blob/master/LICENSE)
[![Coverage Status](https://img.shields.io/coverallsCoverage/github/terrestris/ol-util?style=flat-square)](https://coveralls.io/github/terrestris/ol-util?branch=master)
![GitHub action build](https://img.shields.io/github/actions/workflow/status/terrestris/ol-util/on-push-master.yml?branch=master&style=flat-square)
[![Known Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/terrestris/ol-util?style=flat-square)](https://snyk.io/test/github/terrestris/ol-util)

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

`npm run watch:buildto` can be used to inject an updated version of `ol-util` into another project. The script will also watch for further changes. Example usage for [react-geo](https://github.com/terrestris/react-geo):

```sh
npm run watch:buildto ../react-geo/node_modules/@terrestris/ol-util
```
