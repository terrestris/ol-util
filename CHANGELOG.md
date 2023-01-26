## [10.2.1](https://github.com/terrestris/ol-util/compare/v10.2.0...v10.2.1) (2023-01-26)


### Bug Fixes

* reintroduces the use of propertyNames ([c222326](https://github.com/terrestris/ol-util/commit/c2223264ba71f6c1e897b592502e019006b853fb))

# [10.2.0](https://github.com/terrestris/ol-util/compare/v10.1.3...v10.2.0) (2023-01-23)


### Bug Fixes

* fix semantic release action ([#925](https://github.com/terrestris/ol-util/issues/925)) ([36fef96](https://github.com/terrestris/ol-util/commit/36fef9639b1e7f197aea2491606cc645b39d5927))


### Features

* add custom print params for wms ([#923](https://github.com/terrestris/ol-util/issues/923)) ([04dc9fb](https://github.com/terrestris/ol-util/commit/04dc9fb8d35f6a5e3f682afbbef0e21c62fa072f))
* use node 18 for semantic release ([#924](https://github.com/terrestris/ol-util/issues/924)) ([ecf52b9](https://github.com/terrestris/ol-util/commit/ecf52b9af80c8a7d3fc5804ba819057cd448e063))

## [10.1.3](https://github.com/terrestris/ol-util/compare/v10.1.2...v10.1.3) (2022-12-15)


### Bug Fixes

* source type detection in production builds ([e1f9595](https://github.com/terrestris/ol-util/commit/e1f9595300bf496d549ca8edbfd9cd169e8c1e2a))

## [10.1.2](https://github.com/terrestris/ol-util/compare/v10.1.1...v10.1.2) (2022-12-13)


### Bug Fixes

* printing with inkmap decoupled from openlayers version ([2a01705](https://github.com/terrestris/ol-util/commit/2a017051992cfc2aa1b7966f2ed1d2bb76594730))

## [10.1.1](https://github.com/terrestris/ol-util/compare/v10.1.0...v10.1.1) (2022-12-12)


### Bug Fixes

* adjusts filter in permalink for image layer ([a977ac5](https://github.com/terrestris/ol-util/commit/a977ac50c9a2168543ef9c6dcde3ad6658b76e51))

# [10.1.0](https://github.com/terrestris/ol-util/compare/v10.0.1...v10.1.0) (2022-12-12)


### Bug Fixes

* tests adjusted to legend graphic request param ([fca5780](https://github.com/terrestris/ol-util/commit/fca5780fb50d22a84a3285ec179f0de70ea0cbcb))


### Features

* get legend url for wmts from layer property ([589e981](https://github.com/terrestris/ol-util/commit/589e98190bcdf2e89938056aed9a2079b299ade1))

## [10.0.1](https://github.com/terrestris/ol-util/compare/v10.0.0...v10.0.1) (2022-12-09)


### Bug Fixes

* fix extraction of legend url ([#877](https://github.com/terrestris/ol-util/issues/877)) ([931797e](https://github.com/terrestris/ol-util/commit/931797e751b57f8f251b5652f7ca3f062794aec8))
* include image layers in permalink ([#878](https://github.com/terrestris/ol-util/issues/878)) ([f0dcf60](https://github.com/terrestris/ol-util/commit/f0dcf60af4dc150a83e1f03742b68e0232dd9ab5))

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
