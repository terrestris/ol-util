# [10.0.0](https://github.com/terrestris/ol-util/compare/v9.0.0...v10.0.0) (2022-11-15)


### Bug Fixes

* restore attribute config object for multiple feature types ([776c2f2](https://github.com/terrestris/ol-util/commit/776c2f238c61f405f105919769c2298919888361))


### BREAKING CHANGES

* attributeDetails expects a nested object mapping requestable
feature types to their attribute details

# [9.0.0](https://github.com/terrestris/ol-util/compare/v8.1.0...v9.0.0) (2022-11-14)


### Bug Fixes

* adaptaions after ol7 upgrade ([15edac9](https://github.com/terrestris/ol-util/commit/15edac9660274ff371dbaebe6359cc444ae722c6))
* fix import after ol upgrade ([8f07aa6](https://github.com/terrestris/ol-util/commit/8f07aa642e4d3d5abf8a0c31fc0b7f7c239993fa))
* get rid of unnecessary quotes ([10eb361](https://github.com/terrestris/ol-util/commit/10eb3612353a272a9c24e050776738b35bc8e705))


### chore

* upgrade to ol7 ([0c64775](https://github.com/terrestris/ol-util/commit/0c64775b891bc01fe9d3c8363f789778632a4cc7))


### BREAKING CHANGES

* set ol peer dependency to 7.1

# [8.1.0](https://github.com/terrestris/ol-util/compare/v8.0.0...v8.1.0) (2022-10-28)


### Bug Fixes

* export of compiled sources and location of test assets ([638996a](https://github.com/terrestris/ol-util/commit/638996aaf2e2581033f7748f0a949673260e8ce9))
* output directory of docs required for build pipeline ([3625867](https://github.com/terrestris/ol-util/commit/3625867e89a5a44e04bfa4b14680e417a377c871))
* remove uneeded release phase ([626b768](https://github.com/terrestris/ol-util/commit/626b7680304c01e900e75b7f82baae4904034112))
* set correct default branch ([6c528d1](https://github.com/terrestris/ol-util/commit/6c528d16c2980367dc7718c441a8841f9b2216c9))


### Features

* introduce commitlint to use predefined commit message conventions ([1422aa5](https://github.com/terrestris/ol-util/commit/1422aa59c2a87a1474a972ab7b5bafa6b6164a86))
* introduce semantic-release plugin ([9cbe0c0](https://github.com/terrestris/ol-util/commit/9cbe0c002b1206367c373001dda03206c3f7e3ba))

# [8.0.0]

### :rotating_light: BREAKING CHANGES :rotating_light:

* Adds typings for all util functions. This may lead to type conflicts in certain projects
* `CapabilitiesUtil.parseWmsCapabilities(…)` has been removed. Can be replaced by `CapabilitiesUtil.getWmsCapabilities(…)`
* `GeomtryUtil`
  * Use `ProjectionLike` (OpenLayers ype) instead of `string` for projections
  * `separateGeometries` can either handle simple geometry or geometry array now
* `MapUtil`
  * remove `getInteractionsByClass` in MapUtils - Instead:
    * set name to interaction and use `getInteractionByName`
    * filter interactions using `typeof` in your project
  * `ProjectionUtil`:
    * Crs definitions are typed now and `defaultProj4CrsDefinitions` moved to an array of `CrsDefinition`
      * if custom definitions are used in `initProj4Definitions` these have to migrated in the following way:
      ```javascript
      {
         'EPSG:25832': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
         'EPSG:25833': '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
      }
      ```
      has to be migrated to
      ```typescript
      [{
        crsCode: 'EPSG:25832',
        definition: '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
      }, {
        crsCode: 'EPSG:25833',
        definition: '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'}
      }]
      ```
    * Crs mappings are typed now and `defaultProj4CrsMappings` moved to an array of `CrsMapping`
      * if custom definitions are used in `initProj4DefinitionMappings` these have to migrated in the following way:
      ```javascript
      {
          'urn:ogc:def:crs:EPSG::25832': 'EPSG:25832',
          'urn:ogc:def:crs:EPSG::25833': 'EPSG:25833'
      }
      ```
      has to be migrated to
      ```typescript
      [{
        alias: 'urn:ogc:def:crs:EPSG::25832',
        mappedCode: 'EPSG:25832'
      }, {
        alias: 'urn:ogc:def:crs:EPSG::25833',
        mappedCode: 'EPSG:25833'
      }]
      ```
* `WfsFilterUtil` has completely been overhauled:
  * in contrast to the migrated `WfsFilterUtil`, from now on the search / filter has to be configured using the new type `SearchConfig`.
  * For example: a filter creation for an exact search of `my search term` in attribute `name` of feature type `TEST:MYTYPE` looks like this:
  ```typescript
    const attributeDetails: AttributeDetails [] = [{
      type: 'string',
      exactSearch: true,
      attributeName: 'name'
    }];
    const searchTerm = 'my search term';
    const filter = WfsFilterUtil.createWfsFilter(searchTerm, attributeDetails);
  };
  ```
