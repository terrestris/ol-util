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
import { flatten } from '@turf/turf';

/** @typedef {import("ol/geom/Geometry").default} OlGeomGeometry */
/** @typedef {import("ol/geom/Polygon").default} OlGeomPolygon */
/** @typedef {import("ol/geom/Point").default} OlGeomPoint */
/** @typedef {import("ol/geom/LineString").default} OlGeomLineString */
/** @typedef {import("ol/geom/SimpleGeometry").default} OlGeomSimple */

/**
 * @typedef {import("@turf/helpers").Feature<import("@turf/helpers").Polygon|import("@turf/helpers").MultiPolygon>} TurfFeature
 * See https://github.com/Turfjs/turf/issues/1658
 */

/**
 * @template {OlGeomGeometry} T
 * @param {OlFeature<T>|T} featureOrGeom
 */
function toGeom(featureOrGeom) {
  if (featureOrGeom instanceof OlFeature) {
    const geom = featureOrGeom.getGeometry();
    if (geom === undefined) {
      throw new Error('Feature has no geometry.');
    }
    return geom;
  } else {
    return featureOrGeom;
  }
}

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
   * @param {OlFeature<OlGeomPolygon> | OlGeomPolygon} polygon The polygon geometry to split.
   * @param {OlFeature<OlGeomLineString> | OlGeomLineString} line The line geometry to split the polygon
   *  geometry with.
   * @param {import("ol/proj").ProjectionLike} projection The EPSG code of the input features.
   *  Default is to EPSG:3857.
   * @returns {OlFeature[] | OlGeomPolygon[]} An array of instances of ol.feature
   *  with/or ol.geom.Polygon
   */
  static splitByLine(polygon, line, projection = 'EPSG:3857') {
    const returnFeature = polygon instanceof OlFeature;

    const geometries = GeometryUtil.splitGeometryByLine(toGeom(polygon), toGeom(line), projection);

    if (returnFeature) {
      return geometries.map(geom => new OlFeature(geom));
    } else {
      return geometries;
    }
  }

  /**
   * Splits an ol.geom.Polygon by an ol.geom.LineString
   * into an array of instances of ol.geom.Polygon.
   *
   * @param {OlGeomPolygon} polygon The polygon geometry to split.
   * @param {OlGeomLineString} line The line geometry to split the polygon
   *  geometry with.
   * @param {import("ol/proj").ProjectionLike} projection The EPSG code of the input features.
   *  Default is to EPSG:3857.
   * @returns {OlGeomPolygon[]} An array of instances of ol.geom.Polygon
   */
  static splitGeometryByLine(polygon, line, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });

    const polyJson = geoJsonFormat.writeGeometryObject(polygon);
    const lineJson = geoJsonFormat.writeGeometryObject(line);

    /** @type {import("@turf/helpers").AllGeoJSON} */
    const result = polygonSplitter(polyJson, lineJson);

    const flattened = flatten(result);

    return flattened.features.map(geojsonFeature => {
      return /** @type {OlGeomPolygon} */ (geoJsonFormat.readGeometry(geojsonFeature.geometry));
    });
  }

  /**
   * Adds a buffer to a given geometry.
   *
   * If the target is of type ol.Feature it will return an ol.Feature.
   * If the target is of type ol.geom.Geometry it will return ol.geom.Geometry.
   *
   * @param {OlGeomGeometry | OlFeature} geometryOrFeature The geometry.
   * @param {number} radius The buffer to add in meters.
   * @param {string} projection The projection of the input geometry as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomGeometry | OlFeature} The geometry or feature with the added buffer.
   */
  static addBuffer(geometryOrFeature, radius = 0, projection = 'EPSG:3857') {
    if (geometryOrFeature instanceof OlFeature) {
      return new OlFeature(GeometryUtil.addGeometryBuffer(toGeom(geometryOrFeature), radius, projection));
    } else {
      return GeometryUtil.addGeometryBuffer(geometryOrFeature, radius, projection);
    }
  }

  /**
   * Adds a buffer to a given geometry.
   *
   * @param {OlGeomGeometry} geometry The geometry.
   * @param {number} radius The buffer to add in meters.
   * @param {string} projection The projection of the input geometry as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomGeometry} The geometry with the added buffer.
   */
  static addGeometryBuffer(geometry, radius = 0, projection = 'EPSG:3857') {
    if (radius === 0) {
      return geometry;
    }
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geoJson = geoJsonFormat.writeGeometryObject(geometry);
    const buffered = buffer(geoJson, radius, {
      units: 'meters'
    });
    return geoJsonFormat.readGeometry(buffered.geometry);
  }

  /**
   * Merges multiple geometries into one MultiGeometry.
   *
   * @param {OlGeomSimple[]} geometries An array of ol.geom.geometries;
   * @returns {OlGeomMultiPoint|OlGeomMultiPolygon|OlGeomMultiLineString|undefined} A Multigeometry.
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
    const splittedGeometries = GeometryUtil.separateGeometries(geometries);

    if (geomType.startsWith(multiPrefix)) {
      geomType = geomType.substring(multiPrefix.length);
    }

    let multiGeom;
    switch (geomType) {
      case 'Polygon':
        multiGeom = new OlGeomMultiPolygon([]);
        for (const geom of splittedGeometries) {
          multiGeom.appendPolygon(/** @type {OlGeomPolygon} */ (geom));
        }
        return multiGeom;
      case 'Point':
        multiGeom = new OlGeomMultiPoint([]);
        for (const geom of splittedGeometries) {
          multiGeom.appendPoint(/** @type {OlGeomPoint} */ (geom));
        }
        return multiGeom;
      case 'LineString':
        multiGeom = new OlGeomMultiLineString([]);
        for (const geom of splittedGeometries) {
          multiGeom.appendLineString(/** @type {OlGeomLineString} */ (geom));
        }
        return multiGeom;
      default:
        return undefined;
    }
  }

  /**
   * Splits an array of geometries (and multi geometries) or a single MultiGeom
   * into an array of single geometries.
   *
   * @param {OlGeomSimple|OlGeomSimple[]} geometries An (array of) ol.geom.geometries;
   * @returns {Omit<OlGeomSimple, OlGeomMultiPolygon|OlGeomMultiLineString|OlGeomMultiPoint>[]} An array of geometries.
   */
  static separateGeometries(geometries) {
    geometries = Array.isArray(geometries) ? geometries : [geometries];

    return geometries.flatMap(geometry => {
      if (geometry instanceof OlGeomMultiPolygon) {
        return geometry.getPolygons();
      }
      if (geometry instanceof OlGeomMultiLineString) {
        return geometry.getLineStrings();
      }
      if (geometry instanceof OlGeomMultiPoint) {
        return geometry.getPoints();
      }
      return [geometry];
    });
  }

  /**
   * Takes two or more polygons and returns a combined (Multi-)polygon.
   *
   * @param {OlFeature<OlGeomPolygon>[]} polygons An array of ol.Feature
   *  or ol.geom.Geometry instances of type Polygon.
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   * @returns {OlGeomMultiPolygon|OlGeomPolygon|OlFeature<OlGeomMultiPolygon|OlGeomPolygon>|undefined} A Feature or Geometry with the
   * combined area of the (Multi-)polygons.
   */
  static union(polygons, projection = 'EPSG:3857') {
    const geometries = polygons.map(toGeom);
    const union = GeometryUtil.unionGeometries(geometries, projection);
    if (polygons[0] instanceof OlFeature) {
      return new OlFeature(union);
    } else {
      return union;
    }
  }

  /**
   * Takes two or more polygons and returns a combined (Multi-)polygon.
   *
   * @param {OlGeomPolygon[]} polygons An array of ol.geom.Geometry instances of type (Multi-)polygon.
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   * @returns {OlGeomMultiPolygon|OlGeomPolygon|undefined} A FGeometry with the combined area of the (Multi-)polygons.
   */
  static unionGeometries(polygons, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });

    const geometry = polygons
      .map(p => geoJsonFormat.writeFeatureObject(new OlFeature(p)))
      .reduce((prev, next) => {
        return /** @type {import("geojson").Feature} */ (union(/** @type {TurfFeature} */ (prev), /** @type {TurfFeature} */ (next)));
      });

    return /** @type {OlGeomMultiPolygon|OlGeomPolygon} */ (geoJsonFormat.readFeature(geometry).getGeometry());
  }

  /**
   * Finds the difference between two polygons by clipping the second polygon from the first.
   *
   * If both polygons are of type ol.Feature it will return an ol.Feature.
   * Else it will return an ol.geom.Geometry.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon1 An ol.geom.Geometry or ol.Feature
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon2 An ol.geom.Geometry or ol.Feature
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} A Feature or Geometry with the area
   *  of polygon1 excluding the area of polygon2.
   */
  static difference(polygon1, polygon2, projection = 'EPSG:3857') {
    if (polygon1 instanceof OlFeature && polygon2 instanceof OlFeature) {
      return new OlFeature(GeometryUtil.geometryDifference(toGeom(polygon1), toGeom(polygon2), projection));
    } else {
      return GeometryUtil.geometryDifference(toGeom(polygon1), toGeom(polygon2), projection);
    }
  }

  /**
   * Finds the difference between two polygons by clipping the second polygon from the first.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon} polygon1 An ol.geom.Geometry
   * @param {OlGeomPolygon|OlGeomMultiPolygon} polygon2 An ol.geom.Geometry
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon} A with the area
   *  of polygon1 excluding the area of polygon2.
   */
  static geometryDifference(polygon1, polygon2, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geojson1 = geoJsonFormat.writeFeatureObject(new OlFeature(polygon1));
    const geojson2 = geoJsonFormat.writeFeatureObject(new OlFeature(polygon2));
    const intersection = difference(/** @type {TurfFeature} */ (geojson1), /** @type {TurfFeature} */ (geojson2));
    const feature = geoJsonFormat.readFeature(intersection);
    return /** @type {OlGeomPolygon|OlGeomMultiPolygon} */ (feature.getGeometry());
  }

  /**
   * Takes two polygons and finds their intersection.
   *
   * If both polygons are of type ol.Feature it will return an ol.Feature.
   * Else it will return an ol.geom.Geometry.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon1 An ol.geom.Geometry or ol.Feature
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon2 An ol.geom.Geometry or ol.Feature
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>|null} A Feature or Geometry with the
   * shared area of the two polygons or null if the polygons don't intersect.
   */
  static intersection(polygon1, polygon2, projection = 'EPSG:3857') {
    const intersection = GeometryUtil.geometryIntersection(toGeom(polygon1), toGeom(polygon2), projection);
    if (!intersection) {
      return null;
    }
    if (polygon1 instanceof OlFeature && polygon2 instanceof OlFeature) {
      return new OlFeature(intersection);
    } else {
      return intersection;
    }
  }

  /**
   * Takes two polygons and finds their intersection.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon} polygon1 An ol.geom.Geometry
   * @param {OlGeomPolygon|OlGeomMultiPolygon} polygon2 An ol.geom.Geometry
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon|null} A Geometry with the
   * shared area of the two polygons or null if the polygons don't intersect.
   */
  static geometryIntersection(polygon1, polygon2, projection = 'EPSG:3857') {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geojson1 = geoJsonFormat.writeFeatureObject(new OlFeature(polygon1));
    const geojson2 = geoJsonFormat.writeFeatureObject(new OlFeature(polygon2));
    const intersection = intersect(/** @type {TurfFeature} */ (geojson1), /** @type {TurfFeature} */ (geojson2));
    if (!intersection) {
      return null;
    }
    return /** @type {OlGeomPolygon|OlGeomMultiPolygon} */ (geoJsonFormat.readFeature(intersection).getGeometry());
  }
}
export default GeometryUtil;
