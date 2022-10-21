import buffer from '@turf/buffer';
import difference from '@turf/difference';
import intersect from '@turf/intersect';
import { flatten } from '@turf/turf';
import union from '@turf/union';
import { Feature, Polygon as GeoJsonPolygon } from 'geojson';
import _isNil from 'lodash/isNil';
import OlFeature from 'ol/Feature';
import OlFormatGeoJSON, { GeoJSONMultiPolygon } from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';
import OlGeomLineString from 'ol/geom/LineString';
import OlGeomMultiLineString from 'ol/geom/MultiLineString';
import OlGeomMultiPoint from 'ol/geom/MultiPoint';
import OlGeomMultiPolygon from 'ol/geom/MultiPolygon';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';
import { ProjectionLike } from 'ol/proj';
import polygonSplitter from 'polygon-splitter';

/**
 * @template {OlGeomGeometry} T
 * @param {OlFeature<T>|T} featureOrGeom
 */
function toGeom<Geom extends OlGeometry>(featureOrGeom: OlFeature<Geom> | Geom) {
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
  static splitByLine(
    polygon: OlFeature<OlGeomPolygon> | OlGeomPolygon,
    line: OlFeature<OlGeomLineString>,
    projection: ProjectionLike = 'EPSG:3857'
  ): OlGeomPolygon[] | OlFeature<OlGeomPolygon>[] {
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
   * @param {ProjectionLike} projection The EPSG code of the input features.
   *  Default is to EPSG:3857.
   * @returns {OlGeomPolygon[]} An array of instances of ol.geom.Polygon
   */
  static splitGeometryByLine(
    polygon: OlGeomPolygon,
    line: OlGeomLineString,
    projection: ProjectionLike = 'EPSG:3857'
  ): OlGeomPolygon[] {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });

    const polyJson = geoJsonFormat.writeGeometryObject(polygon);
    const lineJson = geoJsonFormat.writeGeometryObject(line);

    const result = polygonSplitter(polyJson, lineJson);

    const flattened = flatten(result);

    return flattened.features.map(geojsonFeature => {
      return geoJsonFormat.readGeometry(geojsonFeature.geometry) as OlGeomPolygon;
    });
  }

  /**
   * Adds a buffer to a given geometry.
   *
   * If the target is of type ol.Feature it will return an ol.Feature.
   * If the target is of type ol.geom.Geometry it will return ol.geom.Geometry.
   *
   * @param {OlGeometry | OlFeature} geometryOrFeature The geometry.
   * @param {number} radius The buffer to add in meters.
   * @param {string} projection The projection of the input geometry as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeometry | OlFeature} The geometry or feature with the added buffer.
   */
  static addBuffer(
    geometryOrFeature: OlFeature<OlGeometry> | OlGeometry,
    radius: number = 0,
    projection: ProjectionLike = 'EPSG:3857'
  ) {
    if (geometryOrFeature instanceof OlFeature) {
      return new OlFeature(GeometryUtil.addGeometryBuffer(toGeom(geometryOrFeature), radius, projection));
    } else {
      return GeometryUtil.addGeometryBuffer(geometryOrFeature, radius, projection);
    }
  }

  /**
   * Adds a buffer to a given geometry.
   *
   * @param {OlGeometry} geometry The geometry.
   * @param {number} radius The buffer to add in meters.
   * @param {string} projection The projection of the input geometry as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeometry} The geometry with the added buffer.
   */
  static addGeometryBuffer(geometry: OlGeometry, radius: number = 0, projection: ProjectionLike = 'EPSG:3857') {
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
   * @param {(OlGeomMultiPoint|OlGeomPoint)[]|(OlGeomMultiPolygon|OlGeomPolygon)[]|
   *   (OlGeomMultiLineString|OlGeomLineString)[]} geometries An array of ol.geom.geometries;
   * @returns {OlGeomMultiPoint|OlGeomMultiPolygon|OlGeomMultiLineString} A Multigeometry.
   */
  static mergeGeometries<Geom extends OlGeometry>(geometries: Geom[]) {
    // split all multi-geometries to simple ones if passed geometries are
    // multi-geometries
    const separateGeometries = GeometryUtil.separateGeometries(geometries);

    if (separateGeometries[0] instanceof OlGeomPolygon) {
      const multiGeom = new OlGeomMultiPolygon([]);
      for (const geom of separateGeometries) {
        multiGeom.appendPolygon(/** @type {OlGeomPolygon} */ (geom));
      }
      return multiGeom;
    } else if (separateGeometries[0] instanceof OlGeomLineString) {
      const multiGeom = new OlGeomMultiLineString([]);
      for (const geom of separateGeometries) {
        multiGeom.appendLineString(/** @type {OlGeomLineString} */ (geom));
      }
      return multiGeom;
    } else {
      const multiGeom = new OlGeomMultiPoint([]);
      for (const geom of separateGeometries) {
        multiGeom.appendPoint(geom as OlGeomPoint);
      }
      return multiGeom;
    }
  }

  /**
   * Splits an array of geometries (and multi geometries) or a single MultiGeom
   * into an array of single geometries.
   *
   * @param {MaybeArray<OlGeomPoint|OlGeomMultiPoint|OlGeomLineString|
   *    OlGeomMultiLineString|OlGeomPolygon|OlGeomMultiPolygon>} geometries An (array of) ol.geom.geometries;
   * @returns {(OlGeomPoint|OlGeomLineString|OlGeomPolygon)[]} An array of geometries.
   */
  static separateGeometries(geometries: any): any[] {
    return geometries.flatMap((geometry: any) => {
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
   * @param {ProjectionLike} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   * @returns {OlGeomMultiPolygon|OlGeomPolygon|OlFeature<OlGeomMultiPolygon|OlGeomPolygon>} A Feature or Geometry with
   * the combined area of the (Multi-)polygons.
   */
  static union(polygons: OlGeomPolygon[], projection: ProjectionLike = 'EPSG:3857') {
    const geometries = polygons.map(toGeom);
    const unionGeometry = GeometryUtil.unionGeometries(geometries, projection);
    if (polygons[0] instanceof OlFeature) {
      return new OlFeature(unionGeometry);
    } else {
      return unionGeometry;
    }
  }

  /**
   * Takes two or more polygons and returns a combined (Multi-)polygon.
   *
   * @param {OlGeomPolygon[]} polygons An array of ol.geom.Geometry instances of type (Multi-)polygon.
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   * @returns {OlGeomMultiPolygon|OlGeomPolygon} A FGeometry with the combined area of the (Multi-)polygons.
   */
  static unionGeometries(polygons: OlGeomPolygon[], projection: ProjectionLike = 'EPSG:3857'):
    OlGeomMultiPolygon | OlGeomPolygon
  {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });

    const pp = polygons
      .map((p: OlGeomPolygon) => {
        const polygon = geoJsonFormat.writeGeometryObject(p) as GeoJsonPolygon;
        const feature: Feature<GeoJsonPolygon | GeoJSONMultiPolygon> = {
          geometry: polygon,
          properties: {},
          type: 'Feature'
        };
        return feature;
      });
    const unionGeometry = pp.reduce((prev, next) => union(prev, next) ?? prev);
    return geoJsonFormat.readFeature(unionGeometry).getGeometry() as OlGeomMultiPolygon | OlGeomPolygon;
  }

  /**
   * Finds the difference between two polygons by clipping the second polygon from the first.
   *
   * If both polygons are of type ol.Feature it will return an ol.Feature.
   * Else it will return an ol.geom.Geometry.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon1
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon2
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} A Feature or geometry
   *  with the area of polygon1 excluding the area of polygon2.
   */
  static difference(
    polygon1: OlFeature<OlGeomPolygon> | OlGeomPolygon,
    polygon2: OlFeature<OlGeomPolygon> | OlGeomPolygon,
    projection: ProjectionLike = 'EPSG:3857'
  ): OlGeomMultiPolygon | OlGeomPolygon {
    return GeometryUtil.geometryDifference(toGeom(polygon1), toGeom(polygon2), projection);
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
  static geometryDifference(
    polygon1: OlGeomPolygon,
    polygon2: OlGeomPolygon,
    projection: ProjectionLike = 'EPSG:3857'
  ): OlGeomMultiPolygon | OlGeomPolygon {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geojson1 = geoJsonFormat.writeGeometryObject(polygon1) as GeoJsonPolygon;
    const geojson2 = geoJsonFormat.writeGeometryObject(polygon2) as GeoJsonPolygon;
    const intersection = difference(geojson1, geojson2);
    const feature = geoJsonFormat.readFeature(intersection);
    return feature.getGeometry() as OlGeomMultiPolygon | OlGeomPolygon;
  }

  /**
   * Takes two polygons and finds their intersection.
   *
   * If both polygons are of type ol.Feature it will return an ol.Feature.
   * Else it will return an ol.geom.Geometry.
   *
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon1
   * @param {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>} polygon2
   * @param {string} projection The projection of the input polygons as EPSG code.
   *  Default is to EPSG:3857.
   *
   * @returns {OlGeomPolygon|OlGeomMultiPolygon|OlFeature<OlGeomPolygon|OlGeomMultiPolygon>|null} A Feature or Geometry
   * with the shared area of the two polygons or null if the polygons don't intersect.
   */
  static intersection(
    polygon1: OlGeomPolygon,
    polygon2: OlGeomPolygon,
    projection: ProjectionLike = 'EPSG:3857'
  ): OlGeomMultiPolygon | OlGeomPolygon | undefined {
    const intersectionGeometry = GeometryUtil.geometryIntersection(toGeom(polygon1), toGeom(polygon2), projection);
    if (_isNil(intersectionGeometry)) {
      return;
    }
    return intersectionGeometry;
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
  static geometryIntersection(
    polygon1: OlGeomPolygon,
    polygon2: OlGeomPolygon,
    projection: ProjectionLike = 'EPSG:3857'
  ) {
    const geoJsonFormat = new OlFormatGeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: projection
    });
    const geojson1 = geoJsonFormat.writeGeometryObject(polygon1) as GeoJsonPolygon;
    const geojson2 = geoJsonFormat.writeGeometryObject(polygon2) as GeoJsonPolygon;
    const intersection = intersect(geojson1, geojson2);
    if (!intersection) {
      return null;
    }
    const feature = geoJsonFormat.readFeature(intersection);
    return feature.getGeometry() as OlGeomMultiPolygon | OlGeomPolygon;
  }
}
export default GeometryUtil;
