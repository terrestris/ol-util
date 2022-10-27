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
* `WfsFilterUtil` as completely been overhauled:
  * in contrast to the migrated `WfsFilterUtil`, from now on the search / filter has to be configured using new type `SearchConfig`.
  * For example: a filter creation for an exact search of `my search term` in attribute `name` of feature type `TEST:MYTYPE` look slike this:
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
