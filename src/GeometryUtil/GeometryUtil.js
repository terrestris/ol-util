import OlFeature from 'ol/Feature';
import OlGeomMultiPolygon from 'ol/geom/MultiPolygon';
import OlGeomMultiPoint from 'ol/geom/MultiPoint';
import OlGeomMultiLineString from 'ol/geom/MultiLineString';
import OlFormatGeoJSON from 'ol/format/GeoJSON';

import buffer from '@turf/buffer';
import difference from '@turf/difference';
import intersect from '@turf/intersect';
import union from '@turf/union';
import polygonSplitter from 'polygon-splitter';
import { flattenReduce } from '@turf/turf';

/**
 * Helper class for the geospatial analysis. Makes use of
 * [Turf.js](http://turfjs.org/).
 *
 * @class GeometryUtil
 */
class GeometryUtil {

  /**
   * The prefix used to detect multi geometries.
   * @ignore
   */
  static MULTI_GEOM_PREFIX = 'Multi';

  /**
   * Splits an ol.feature with/or ol.geom.Polygon by an ol.feature with/or ol.geom.LineString
   * into an array of instances of ol.feature with/or ol.geom.Polygon.
   * If the target polygon (first param) is of type ol.Feature it will return an
   * array with ol.Feature. If the target polygon (first param) is of type
   * ol.geom.Geometry it will return an array with ol.geom.Geometry.
   *
   * @param {ol.Feature | ol.geom.Polygon} polygon The polygon geometry to split.
   * @param {ol.Feature | ol.geom.LineString} line The line geometry to split the polygon
   *  geometry with.
   * @param {ol.ProjectionLike} projection The EPSG code of the input features.
   *  Default is to EPSG:3857.
   * @returns {ol.Feature[] | ol.geom.Polygon[]} An array of instances of ol.feature
   *  with/or ol.geom.Polygon
   */
  static splitByLine(polygon, line, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const polygonFeat = polygon instanceof OlFeature ? polygon
      : new OlFeature({
        geometry: polygon
      });
    const lineFeat = line instanceof OlFeature ? line
      : new OlFeature({
        geometry: line
      });
    const polyJson = geoJsonFormat.writeGeometryObject(polygonFeat.getGeometry());
    const lineJson = geoJsonFormat.writeGeometryObject(lineFeat.getGeometry());
    const result = polygonSplitter(polyJson, lineJson);
    const list = [];
    flattenReduce(result, (acc, feature) => {
      if (polygon instanceof OlFeature) {
        acc.push(geoJsonFormat.readFeature(feature));
      } else {
        acc.push(geoJsonFormat.readGeometry(feature.geometry));
      }
      return list;
    }, list);
    return list;
  }

  /**
   * Adds a buffer to a given geometry.
   *
   * If the target is of type ol.Feature it will return an ol.Feature.
   * If the target is of type ol.geom.Geometry it will return ol.geom.Geometry.
   *
   * @param {ol.geom.Geometry | ol.Feature} geometry The geometry.
   * @param {number} radius The buffer to add in meters.
   * @param {string} projection The projection of the input geometry as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {ol.geom.Geometry | ol.Feature} The geometry or feature with the added buffer.
   */
  static addBuffer(geometry, radius = 0, projection = 'EPSG:3857') {
    if (radius === 0) {
      return geometry;
    }
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geoJson = geometry instanceof OlFeature
      ? geoJsonFormat.writeFeatureObject(geometry)
      : geoJsonFormat.writeGeometryObject(geometry);
    const buffered = buffer(geoJson, radius, {
      units: 'meters'
    });
    if (geometry instanceof OlFeature) {
      return geoJsonFormat.readFeature(buffered);
    } else {
      return geoJsonFormat.readGeometry(buffered.geometry);
    }
  }

  /**
   * Merges multiple geometries into one MultiGeometry.
   *
   * @param {ol.geom.Geometry[]} geometries An array of ol.geom.geometries;
   * @returns {ol.geom.MultiPoint|ol.geom.MultiPolygon|ol.geom.MultiLineString} A Multigeometry.
   */
  static mergeGeometries(geometries) {
    const multiPrefix = GeometryUtil.MULTI_GEOM_PREFIX;
    let geomType = geometries[0].getType();
    let mixedGeometryTypes = false;
    geometries.forEach(geometry => {
      if (geomType.replace(multiPrefix, '') !== geometry.getType().replace(multiPrefix, '')) {
        mixedGeometryTypes = true;
      }
    });
    if (mixedGeometryTypes) {
      // Logger.warn('Can not merge mixed geometries into one multigeometry.');
      return undefined;
    }

    // split all multi-geometries to simple ones if passed geometries are
    // multigeometries
    if (geomType.startsWith(multiPrefix)) {
      const multiGeomPartType = geomType.substring(multiPrefix.length);
      geometries = GeometryUtil.separateGeometries(geometries);
      geomType = multiGeomPartType;
    }

    let multiGeom;
    let append;
    switch (geomType) {
      case 'Polygon':
        multiGeom = new OlGeomMultiPolygon([]);
        append = multiGeom.appendPolygon.bind(multiGeom);
        break;
      case 'Point':
        multiGeom = new OlGeomMultiPoint([]);
        append = multiGeom.appendPoint.bind(multiGeom);
        break;
      case 'LineString':
        multiGeom = new OlGeomMultiLineString([]);
        append = multiGeom.appendLineString.bind(multiGeom);
        break;
      default:
        return undefined;
    }
    geometries.forEach(geom => append(geom));
    return multiGeom;
  }

  /**
   * Splits an array of geometries (and multi geometries) or a single MultiGeom
   * into an array of single geometries.
   *
   * Attention: ol.geom.Circle and ol.geom.LinearRing are not supported.
   *
   * @param {ol.geom.SimpleGeometry|ol.geom.SimpleGeometry[]} geometries An (array of) ol.geom.geometries;
   * @returns {ol.geom.Point[]|ol.geom.Polygon[]|ol.geom.LineString[]} An array of geometries.
   */
  static separateGeometries(geometries) {
    const separatedGeometries = [];

    geometries = Array.isArray(geometries) ? geometries : [geometries];

    geometries.forEach(geometry => {
      const geomType = geometry.getType();
      if (geomType.startsWith(GeometryUtil.MULTI_GEOM_PREFIX)) {
        const multiGeomPartType = geomType.substring(GeometryUtil.MULTI_GEOM_PREFIX.length);
        switch (multiGeomPartType) {
          case 'Polygon':
            separatedGeometries.push(...geometry.getPolygons());
            break;
          case 'LineString':
            separatedGeometries.push(...geometry.getLineStrings());
            break;
          case 'Point':
            separatedGeometries.push(...geometry.getPoints());
            break;
          default:
            break;
        }
      } else {
        separatedGeometries.push(geometry);
      }
    });
    return separatedGeometries;
  }

  /**
   * Takes two or more polygons and returns a combined (Multi-)polygon.
   *
   * @param {ol.geom.Geometry[] | ol.Feature[]} polygons An array of ol.Feature
   *  or ol.geom.Geometry instances of type (Multi-)polygon.
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   * @returns {ol.geom.Geometry | ol.Feature} A Feature or Geometry with the
   * combined area of the (Multi-)polygons.
   */
  static union(polygons, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    let invalid = false;
    const geoJsonsFeatures = polygons.map((geometry) => {
      const feature = geometry instanceof OlFeature
        ? geometry
        : new OlFeature({ geometry });
      if (!['Polygon', 'MultiPolygon'].includes(feature.getGeometry().getType())) {
        invalid = true;
      }
      return geoJsonFormat.writeFeatureObject(feature);
    });
    if (invalid) {
      // Logger.warn('Can only create union of polygons.');
      return undefined;
    }
    const unioned = union(...geoJsonsFeatures);
    const feature = geoJsonFormat.readFeature(unioned);
    if (polygons[0] instanceof OlFeature) {
      return feature;
    } else {
      return feature.getGeometry();
    }
  }

  /**
   * Finds the difference between two polygons by clipping the second polygon from the first.
   *
   * @param {ol.geom.Geometry | ol.Feature} polygon1 An ol.geom.Geometry or ol.Feature
   * @param {ol.geom.Geometry | ol.Feature} polygon2 An ol.geom.Geometry or ol.Feature
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {ol.geom.Geometry | ol.Feature} A Feature or Geometry with the area
   *  of polygon1 excluding the area of polygon2. The type of the first polygon
   *  (geometry or feature) determines the return type.
   */
  static difference(polygon1, polygon2, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const feat1 = polygon1 instanceof OlFeature ? polygon1
      : new OlFeature({
        geometry: polygon1
      });
    const feat2 = polygon2 instanceof OlFeature ? polygon2
      : new OlFeature({
        geometry: polygon2
      });
    const geojson1 = geoJsonFormat.writeFeatureObject(feat1);
    const geojson2 = geoJsonFormat.writeFeatureObject(feat2);
    const intersection = difference(geojson1, geojson2);
    const feature = geoJsonFormat.readFeature(intersection);
    if (polygon1 instanceof OlFeature && polygon2 instanceof OlFeature) {
      return feature;
    } else {
      return feature.getGeometry();
    }
  }

  /**
   * Takes two polygons and finds their intersection.
   *
   * If the polygons are of type ol.Feature it will return an ol.Feature.
   * If the polygons are of type ol.geom.Geometry it will return an ol.geom.Geometry.
   *
   * @param {ol.geom.Geometry | ol.Feature} polygon1 An ol.geom.Geometry or ol.Feature
   * @param {ol.geom.Geometry | ol.Feature} polygon2 An ol.geom.Geometry or ol.Feature
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {ol.geom.Geometry | ol.Feature} A Feature or Geometry with the
   * shared area of the two polygons or null if the polygons don't intersect.
   */
  static intersection(polygon1, polygon2, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const feat1 = polygon1 instanceof OlFeature ? polygon1
      : new OlFeature({
        geometry: polygon1
      });
    const feat2 = polygon2 instanceof OlFeature ? polygon2
      : new OlFeature({
        geometry: polygon2
      });
    const geojson1 = geoJsonFormat.writeFeatureObject(feat1);
    const geojson2 = geoJsonFormat.writeFeatureObject(feat2);
    const intersection = intersect(geojson1, geojson2);
    if (!intersection) {
      return null;
    }
    const feature = geoJsonFormat.readFeature(intersection);
    if (polygon1 instanceof OlFeature && polygon2 instanceof OlFeature) {
      return feature;
    } else {
      return feature.getGeometry();
    }
  }

}
export default GeometryUtil;
