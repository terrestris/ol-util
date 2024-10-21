import _isNil from 'lodash';
import _isEmpty from 'lodash/isEmpty';
import _isString from 'lodash/isString';
import { register } from 'ol/proj/proj4';
import proj4, { ProjectionDefinition } from 'proj4';

export interface CrsDefinition {
  crsCode: string;
  definition: string | ProjectionDefinition;
}

export interface CrsMapping {
  alias: string;
  mappedCode: string;
}

/**
 * Default proj4 CRS definitions.
 */
export const defaultProj4CrsDefinitions: CrsDefinition[] = [{
  crsCode: 'EPSG:25832',
  definition: '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'}
, {
  crsCode: 'EPSG:31466',
  // eslint-disable-next-line
  definition: '+proj=tmerc +lat_0=0 +lon_0=6 +k=1 +x_0=2500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
}, {
  crsCode: 'EPSG:31467',
  // eslint-disable-next-line
  definition: '+proj=tmerc +lat_0=0 +lon_0=9 +k=1 +x_0=3500000 +y_0=0 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs'
}];

/**
 * Default mappings for CRS identifiers (e.g. "urn:ogc:def:crs:EPSG::25832").
 */
export const defaultProj4CrsMappings: CrsMapping[] = [{
  alias: 'urn:ogc:def:crs:EPSG::3857',
  mappedCode: 'EPSG:3857'
}, {
  alias: 'urn:ogc:def:crs:EPSG::25832',
  mappedCode: 'EPSG:25832'
}, {
  alias: 'urn:ogc:def:crs:EPSG::31466',
  mappedCode: 'EPSG:31466'
}, {
  alias: 'urn:ogc:def:crs:EPSG::31467',
  mappedCode: 'EPSG:31467'
}];

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
   * @param { CrsDefinition | CrsDefinition[]} customCrsDefs The custom `proj4` definitions
   *   which should be registered additionally to default available CRS (s.
   *   `defaultProj4CrsDefinitions` above) as well.
   *   Further CRS definitions in proj4 format can be checked under
   *   http://epsg.io (e.g. http://epsg.io/3426.proj4).
   * @param {boolean} registerDefaults Whether the default CRS should be
   *   registered or not. Default is true.
   */
  static initProj4Definitions(customCrsDefs?: CrsDefinition | CrsDefinition[], registerDefaults: boolean = true) {
    let proj4CrsDefinitions: CrsDefinition[] = [];

    if (registerDefaults) {
      proj4CrsDefinitions = defaultProj4CrsDefinitions;
    }

    if (!_isNil(customCrsDefs) || customCrsDefs) {
      const crsDefs: CrsDefinition[] = Array.isArray(customCrsDefs) ?
        customCrsDefs : [customCrsDefs] as CrsDefinition[];
      crsDefs?.forEach(crsDef => {
        if (proj4CrsDefinitions?.findIndex(tCrs => tCrs.crsCode === crsDef?.crsCode) === -1){
          proj4CrsDefinitions.push(crsDef);
        }
      });
    }

    if (proj4CrsDefinitions?.length > 0) {
      proj4CrsDefinitions.forEach(crsDef => proj4.defs(crsDef.crsCode, crsDef.definition));
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
   * @param {CrsMapping | CrsMapping[]} customCrsMappings The custom CRS mappings which will be
   *   added additionally to the by default available (s. `defaultProj4CrsMappings`
   *   above).
   * @param {boolean} useDefaultMappings Whether the default CRS should be mapped
   *   as well or not. Default is true.
   */
  static initProj4DefinitionMappings(customCrsMappings: CrsMapping | CrsMapping[], useDefaultMappings = true) {
    let proj4CrsMappings: CrsMapping[] = [];

    if (useDefaultMappings) {
      proj4CrsMappings = defaultProj4CrsMappings;
    }

    if (!_isEmpty(customCrsMappings)) {
      const crsMappings: CrsMapping[] = Array.isArray(customCrsMappings) ?
        customCrsMappings : [customCrsMappings] as CrsMapping[];
      crsMappings?.forEach(crsMapping => {
        if (proj4CrsMappings?.findIndex(mapping => mapping.alias === crsMapping?.alias) === -1){
          proj4CrsMappings.push(crsMapping);
        }
      });
    }

    proj4CrsMappings?.map(crsMapping => {
      const projDef = proj4.defs(crsMapping.mappedCode) as proj4.ProjectionDefinition;
      proj4.defs(crsMapping.alias, projDef);
    });

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
  static toDms(value: number): string {
    const deg = Math.floor(value);
    const min = Math.floor((value - deg) * 60);
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
  static toDmm(value: number): string {
    const deg = Math.floor(value);
    const min = ((value - deg) * 60);
    return `${deg}° ${ProjectionUtil.zerofill(min.toFixed(4))}'`;
  }

  /**
   * Adds leading zero to all values less than 10 and returns this new
   * zerofilled value as String. Values which are greater than 10 are not
   * affected.
   *
   * @param {number|string} value Value to be zerofilled.
   *
   * @return {string} converted value with leading zero if necessary.
   */
  static zerofill(value: number | string): string {
    const asNumber = _isString(value) ? parseFloat(value) : value;
    return asNumber < 10 ? `0${asNumber}` : `${asNumber}`;
  }
}

export default ProjectionUtil;
