import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';

import isEmpty from 'lodash/isEmpty';

/**
 * Default proj4 CRS definitions.
 */
export const defaultProj4CrsDefinitions = {
  'EPSG:25832': '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
  'EPSG:31466': '+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs',
  'EPSG:31467': '+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
};

/**
 * Default mappings for CRS identifiers (e.g. "urn:ogc:def:crs:EPSG::25832").
 */
export const defaultProj4CrsMappings = {
  'urn:ogc:def:crs:EPSG::3857': 'EPSG:3857',
  'urn:ogc:def:crs:EPSG::25832': 'EPSG:25832',
  'urn:ogc:def:crs:EPSG::31466': 'EPSG:31466',
  'urn:ogc:def:crs:EPSG::31467': 'EPSG:31467'
};

/**
 * Helper class for projection handling. Makes use of
 * [Proj4js](http://proj4js.org/).
 *
 * @class ProjectionUtil
 */
export class ProjectionUtil {

  /**
   * Registers custom CRS definitions to the application.
   *
   * @param {Object} customCrsDefs The custom `proj4` definition strings
   *   which should be registered additionally to default avaliable CRS (s.
   *   `defaultProj4CrsDefinitions` above) as well.
   *   Further CRS definitions in proj4 format can be checked under
   *   http://epsg.io (e.g. http://epsg.io/3426.proj4).
   * @param {boolean} registerDefaults Whether the default CRS should be
   *   registered or not. Default is true.
   */
  static initProj4Definitions(customCrsDefs, registerDefaults = true) {
    let proj4CrsDefinitions = {};

    if (registerDefaults) {
      proj4CrsDefinitions = defaultProj4CrsDefinitions;
    }

    if (!isEmpty(customCrsDefs)) {
      Object.keys(customCrsDefs).forEach(crsKey => {
        if (!(crsKey in proj4CrsDefinitions)) {
          proj4CrsDefinitions[crsKey] = customCrsDefs[crsKey];
        }
      });
    }

    if (!isEmpty(proj4CrsDefinitions)) {
      for (let [projCode, projDefinition] of Object.entries(proj4CrsDefinitions)) {
        proj4.defs(projCode, projDefinition);
      }
      register(proj4);
    }
  }

  /**
   * Registers custom CRS mappings to allow automatic CRS detection. Sometimes
   * FeatureCollections returned by the GeoServer may be associated with
   * CRS identifiers (e.g. "urn:ogc:def:crs:EPSG::25832") that aren't
   * supported by `proj4` and `OpenLayers` per default. Add appropriate
   * mappings to allow automatic CRS detection by `OpenLayers` here.
   *
   * @param {Object} customCrsMappings The custom CRS mappings which will be
   *   added additionally to the by default avaliable (s. `defaultProj4CrsMappings`
   *   above).
   * @param {boolean} useDefaultMappings Whether the default CRS should be mapped
   *   as well or not. Default is true.
   */
  static initProj4DefinitionMappings(customCrsMappings, useDefaultMappings = true) {
    let proj4CrsMappings = {};

    if (useDefaultMappings) {
      proj4CrsMappings = defaultProj4CrsMappings;
    }

    if (!isEmpty(customCrsMappings)) {
      Object.keys(customCrsMappings).forEach(crsKey => {
        if (!(crsKey in proj4CrsMappings)) {
          proj4CrsMappings[crsKey] = customCrsMappings[crsKey];
        }
      });
    }

    if (!isEmpty(proj4CrsMappings)) {
      for (let [aliasProjCode, projCode] of Object.entries(proj4CrsMappings)) {
        proj4.defs(aliasProjCode, proj4.defs(projCode));
      }
    }
  }

  /**
   * Converts geographic coordinates given in DDD format like `DD.DDDD°` to
   * the degree, minutes, decimal seconds (DMS) format like
   * `DDD° MM' SS.SSS"`.
   *
   * @param {number} value Value to be converted.
   *
   * @return {string} Converted value.
   */
  static toDms(value) {
    const deg = parseInt(value, 10);
    const min = parseInt((value - deg) * 60, 10);
    const sec = ((value - deg - min / 60) * 3600);
    return `${deg}° ${ProjectionUtil.zerofill(min)}' ${ProjectionUtil.zerofill(sec.toFixed(2))}''`;
  }

  /**
   * Converts geographic coordinates given in DDD format like `DD.DDDD°` to
   * the degree, decimal minutes (DMM) format like `DDD° MM.MMMM`.
   *
   * @param {number} value Value to be converted.
   *
   * @return {string} Converted value.
   */
  static toDmm(value) {
    const deg = parseInt(value, 10);
    const min = ((value - deg) * 60);
    return `${deg}° ${ProjectionUtil.zerofill(min.toFixed(4))}'`;
  }

  /**
   * Adds leading zero to all values less than 10 and returns this new
   * zerofilled value as String. Values which are greater than 10 are not
   * affected.
   *
   * @param {number} value Value to be zerofilled.
   *
   * @return {string} converted value with leading zero if necessary.
   */
  static zerofill(value) {
    return value < 10 ? `0${value}` : value;
  }
}

export default ProjectionUtil;
