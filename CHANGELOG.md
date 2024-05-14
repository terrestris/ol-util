# [18.0.0](https://github.com/terrestris/ol-util/compare/v17.0.1...v18.0.0) (2024-05-14)


### Features

* add wms layer type utils ([adb1ca4](https://github.com/terrestris/ol-util/commit/adb1ca490a43a903ce764cb02d6b493a285fb702))
* remove duplicate `WMSLayer` type ([fa82fdd](https://github.com/terrestris/ol-util/commit/fa82fddbeeaf0cdc84fecce5e4599156d7d39993))


### BREAKING CHANGES

* removes the `WMSLayer` type from `MapUtils`. Use `WmsLayer` from typeUtils instead.
* removes the `LayerUtil.isOlSource(source)` etc. functions in favor of
`instanceof` checks

## [17.0.1](https://github.com/terrestris/ol-util/compare/v17.0.0...v17.0.1) (2024-05-10)


### Bug Fixes

* update getExtentForLayer ([8475afa](https://github.com/terrestris/ol-util/commit/8475afa68d52f88fb74334be40ce5bc0cc348fd7))

# [17.0.0](https://github.com/terrestris/ol-util/compare/v16.0.0...v17.0.0) (2024-04-02)


### Features

* update ol peer dependency ([#1359](https://github.com/terrestris/ol-util/issues/1359)) ([48d513d](https://github.com/terrestris/ol-util/commit/48d513d9eb16d026b7302e6b76d0da9f9ea33cf6))


### BREAKING CHANGES

* Updates the ol peerDependency to version 9

# [16.0.0](https://github.com/terrestris/ol-util/compare/v15.0.1...v16.0.0) (2024-03-05)


### Features

* allow olFilter instances in WfsFilterUtil ([1e01896](https://github.com/terrestris/ol-util/commit/1e0189610cc888fdd20319ee74572868df14a652))


### BREAKING CHANGES

* createWfsFilter returs an OLFilter instance / undefined
now

## [15.0.1](https://github.com/terrestris/ol-util/compare/v15.0.0...v15.0.1) (2024-03-01)


### Bug Fixes

* adds required peer dependencies for ts-eslint ([3665caa](https://github.com/terrestris/ol-util/commit/3665caadfa28af2a55902ccd0095473b97ede8a1))

# [15.0.0](https://github.com/terrestris/ol-util/compare/v14.0.0...v15.0.0) (2024-01-18)


### chore

* update to ol 8.2.0 ([1416bc9](https://github.com/terrestris/ol-util/commit/1416bc9db4a715c627ae2d87766a4145dce02f63))


### BREAKING CHANGES

* updated peer dependency for ol since some typings become more strict

# [14.0.0](https://github.com/terrestris/ol-util/compare/v13.0.0...v14.0.0) (2023-10-09)


### Bug Fixes

* add comment for the decimal precision parameter ([868cd7b](https://github.com/terrestris/ol-util/commit/868cd7b07c592ca942cb228e5f4dd5e7edbfacb7))
* added getLength decimal precision for non geodesic map ([622c40a](https://github.com/terrestris/ol-util/commit/622c40a28adfe075ceab23b1364a0596d2d71b39))
* set length decimal precision to function parameters ([eadd2ff](https://github.com/terrestris/ol-util/commit/eadd2ff58acc3f9444542859ef3f787f07bc8eb9))


### BREAKING CHANGES

* change default decimal precision to 10^6
* change default decimal precision to 10^6
* change default decimal precision to 10^6

# [13.0.0](https://github.com/terrestris/ol-util/compare/v12.0.1...v13.0.0) (2023-09-05)


### chore

* bump ol dependency to 8.x ([8398356](https://github.com/terrestris/ol-util/commit/8398356560fe233055eae31f2bedf4707ba0775d))


### BREAKING CHANGES

* set ol peer dependency to version 8

## [12.0.1](https://github.com/terrestris/ol-util/compare/v12.0.0...v12.0.1) (2023-09-03)


### Bug Fixes

* remove no longer available snyk badge ([498af80](https://github.com/terrestris/ol-util/commit/498af802642e363ab609b27d7e15d44c0df49a5b))

# [12.0.0](https://github.com/terrestris/ol-util/compare/v11.1.0...v12.0.0) (2023-08-31)


### Bug Fixes

* calculation of circle area for metrical and spherical units ([7437a54](https://github.com/terrestris/ol-util/commit/7437a5415f2211acecdd62b228ddedd07c840cf0))
* fix circle area calculation ([59045eb](https://github.com/terrestris/ol-util/commit/59045ebbac54415d93b345b85a2d3f15d041b8c9))
* fix getArea for circles ([38a95f7](https://github.com/terrestris/ol-util/commit/38a95f7b5611a713b7e8f2ae294e92c84cde1289))


### chore

* allow broader version range as peer dependency ([ce0c20a](https://github.com/terrestris/ol-util/commit/ce0c20a35c2bd3c8eb5e3d14a61b9b4ac5f84347))
* set required node version to v18 ([b028124](https://github.com/terrestris/ol-util/commit/b028124a9414ab26caea4617948b21e9382ee411))


### BREAKING CHANGES

* set peer dependency for OpenLayers to ^7
* require node v18

# [11.1.0](https://github.com/terrestris/ol-util/compare/v11.0.0...v11.1.0) (2023-07-19)


### Bug Fixes

* linting issues ([4e1698e](https://github.com/terrestris/ol-util/commit/4e1698ea3b6ddce0cbc4517a8c4901f00bfcab7e))


### Features

* add formatArea for circles ([4a50106](https://github.com/terrestris/ol-util/commit/4a5010620b505c4ab194febe4e0d2aa7a3e51b51))

# [11.0.0](https://github.com/terrestris/ol-util/compare/v10.3.1...v11.0.0) (2023-06-26)


### Bug Fixes

* adds check for capabilities structure ([a43def5](https://github.com/terrestris/ol-util/commit/a43def5617186b5ba017f36637c9692101b6ad26))


### Features

* replace xml2js by fast-xml-parser ([9c69e91](https://github.com/terrestris/ol-util/commit/9c69e91b8bbb610416491157bada62922922a1ae))


### BREAKING CHANGES

* the installation of packages timers and stream is not required any more

## [10.3.1](https://github.com/terrestris/ol-util/compare/v10.3.0...v10.3.1) (2023-06-20)


### Bug Fixes

* fix extent determination for getCapabilities requests v1.1.0 or v1.1.1 ([c838b8d](https://github.com/terrestris/ol-util/commit/c838b8d6795c17d312698ce045d4f42d2fe218de))
* fix instance check ([912b3ab](https://github.com/terrestris/ol-util/commit/912b3ab32e00b7040bc01ec4ef128f0c34b457ac))

# [10.3.0](https://github.com/terrestris/ol-util/compare/v10.2.4...v10.3.0) (2023-05-15)


### Features

* util to set visiblity for a list of layers ([f250e56](https://github.com/terrestris/ol-util/commit/f250e5624e2bdf5fce70a95b186737c590815710))

## [10.2.4](https://github.com/terrestris/ol-util/compare/v10.2.3...v10.2.4) (2023-03-07)


### Bug Fixes

* fix wfs filter builder ([0f59f14](https://github.com/terrestris/ol-util/commit/0f59f14d7cc8b8b2f782f7377a0089db993489c9))

## [10.2.3](https://github.com/terrestris/ol-util/compare/v10.2.2...v10.2.3) (2023-02-17)


### Bug Fixes

* moveFeature in AnimateUtil ([c35ca3b](https://github.com/terrestris/ol-util/commit/c35ca3b0ec954495ca0f802b072a93cc88adf316))

## [10.2.2](https://github.com/terrestris/ol-util/compare/v10.2.1...v10.2.2) (2023-02-06)


### Bug Fixes

* wfs query append ([9358966](https://github.com/terrestris/ol-util/commit/9358966b9197a499b11f62d654c4db583555c819))

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
