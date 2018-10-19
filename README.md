# ol-util

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/ol-util.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/terrestris/ol-util.svg?branch=master)](https://travis-ci.org/terrestris/ol-util)
[![Coverage Status](https://coveralls.io/repos/github/terrestris/ol-util/badge.svg?branch=master)](https://coveralls.io/github/terrestris/ol-util?branch=master)

A set of helper classes for working with openLayers

## Installation

```javascript static
npm i @terrestris/ol-util
```

## API Documentation

### AnimateUtil

  - **moveFeature()**

### CapabilitiesUtil

  - **parseWmsCapabilities()**
  - **getLayersFromWmsCapabilties()**

### FeatureUtil

  - **getFeatureTypeName()**
  - **resolveAttributeTemplate()**

### FileUtil

  - **addGeojsonLayerFromFile()**
  - **addShpLayerFromFile()**
  - **addGeojsonLayer()**

### GeometryUtil

  - **splitByLine()**
  - **addBuffer()**
  - **mergeGeometries()**
  - **separateGeometries()**
  - **union()**
  - **difference()**
  - **intersection()**

### MapUtil

  - **getInteractionsByName()**
  - **getInteractionsByClass()**
  - **getResolutionForScale()**
  - **getScaleForResolution()**
  - **getAllLayers()**
  - **getLayerByOlUid()**
  - **getLayerByName()**
  - **getLayerByNameParam()**
  - **getLayerByFeature()**
  - **getLayersByGroup()**
  - **getLayersByProperty()**
  - **getLayerPositionInfo()**
  - **getLegendGraphicUrl()**
  - **layerInResolutionRange()**
  - **roundScale()**

### MeasureUtil

  - **getLength()**
  - **formatLength()**
  - **getArea()**
  - **formatArea()**
  - **angle()**
  - **angle360()**
  - **makeClockwise()**
  - **makeZeroDegreesAtNorth()**
  - **formatAngle()**

### ProjectionUtil

  - **initProj4Definitions()**
  - **initProj4DefinitionMappings()**

### WfsFilterUtil

  - **createWfsFilter()**
