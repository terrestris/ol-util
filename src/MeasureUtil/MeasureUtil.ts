
import OlGeomCircle from 'ol/geom/Circle';
import OlGeomLineString from 'ol/geom/LineString';
import OlGeomPolygon from 'ol/geom/Polygon';
import OlMap from 'ol/Map';
import { getArea, getLength } from 'ol/sphere';

/**
 * This class provides some static methods which might be helpful when working
 * with measurements.
 *
 * @class MeasureUtil
 */
class MeasureUtil {

  /**
   * Get the length of a OlGeomLineString.
   *
   * @param {OlGeomLineString} line The drawn line.
   * @param {OlMap} map An OlMap.
   * @param {boolean} geodesic Is the measurement geodesic (default is true).
   * @param {number} radius Sphere radius. By default, the radius of the earth
   *                        is used (Clarke 1866 Authalic Sphere, 6371008.8).
   *
   * @return {number} The length of line in meters.
   */
  static getLength(line: OlGeomLineString, map: OlMap, geodesic: boolean = true, radius: number = 6371008.8): number {
    if (geodesic) {
      const opts = {
        projection: map.getView().getProjection().getCode(),
        radius
      };
      return getLength(line, opts);
    } else {
      return Math.round(line.getLength() * 100) / 100;
    }
  }

  /**
   * Format length output for the tooltip.
   *
   * @param {OlGeomLineString} line The drawn line.
   * @param {OlMap} map An OlMap.
   * @param {number} decimalPlacesInToolTips How many decimal places will be
   *   allowed for the measure tooltips
   * @param {boolean} geodesic Is the measurement geodesic (default is true).
   *
   * @return {string} The formatted length of the line (units: km, m or mm).
   */
  static formatLength(
    line: OlGeomLineString, map: OlMap, decimalPlacesInToolTips: number, geodesic = true
  ): string {
    const decimalHelper = Math.pow(10, decimalPlacesInToolTips);
    const length = MeasureUtil.getLength(line, map, geodesic);
    let output;
    if (length > 1000) {
      output = (Math.round(length / 1000 * decimalHelper) /
                decimalHelper) + ' km';
    } else if (length > 1) {
      output = (Math.round(length * decimalHelper) / decimalHelper) +
                ' m';
    } else {
      output = (Math.round(length * 1000 * decimalHelper) / decimalHelper) +
      ' mm';
    }
    return output;
  }

  /**
   * Get the area of an OlGeomPolygon.
   *
   * @param {OlGeomPolygon} polygon The drawn polygon.
   * @param {OlMap} map An OlMap.
   * @param {boolean} geodesic Is the measurement geodesic (default is true).
   * @param {number} radius Sphere radius. By default, the radius of the earth
   *                        is used (Clarke 1866 Authalic Sphere, 6371008.8).
   *
   * @return {number} The area of the polygon in square meter.
   */
  static getArea(
    polygon: OlGeomPolygon,
    map: OlMap,
    geodesic: boolean = true,
    radius: number = 6371008.8
  ): number {
    if (geodesic) {
      const opts = {
        projection: map.getView().getProjection().getCode(),
        radius
      };
      return getArea(polygon, opts);
    } else {
      return polygon.getArea();
    }
  }

  /**
   * Get the estimated area of an OlGeomCircle. The measurement is not perfectly accurate because in OpenLayers
   * the circle is represented by a limited number of vertices.
   *
   * @param {OlGeomCircle} circleGeom The drawn circle.
   * @param {OlMap} map An OlMap.
   * @param {boolean} geodesic Is the measurement geodesic (default is true).
   * @param {number} radius Sphere radius. By default, the radius of the earth
   *                        is used (Clarke 1866 Authalic Sphere, 6371008.8).
   *
   * @return {number} The area of the circle in square meter.
   */
  static getAreaOfCircle(
    circleGeom: OlGeomCircle,
    map: OlMap,
    geodesic: boolean = true,
    radius: number = 6371008.8
  ): number {
    if (geodesic) {
      const opts = {
        projection: map.getView().getProjection().getCode(),
        radius
      };
      return getArea(circleGeom, opts);
    } else {
      return Math.PI * Math.pow(circleGeom.getRadius(), 2);
    }
  }

  /**
   * Format area output for the tooltip.
   *
   * @param {OlGeomPolygon | OlGeomCircle} geom The drawn geometry (circle or polygon).
   * @param {OlMap} map An OlMap.
   * @param {number} decimalPlacesInToolTips How many decimal places will be
   *   allowed for the measure tooltips.
   * @param {boolean} geodesic Is the measurement geodesic.
   *
   * @return {string} The formatted area of the polygon.
   */
  static formatArea(
    geom: OlGeomPolygon | OlGeomCircle,
    map: OlMap,
    decimalPlacesInToolTips: number,
    geodesic: boolean = true
  ): string {
    const decimalHelper = Math.pow(10, decimalPlacesInToolTips);
    let area;
    if (geom instanceof OlGeomCircle) {
      area = MeasureUtil.getAreaOfCircle(geom, map, geodesic);
    } else {
      area = MeasureUtil.getArea(geom, map, geodesic);
    }
    let output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * decimalHelper) /
                decimalHelper) + ' km<sup>2</sup>';
    } else if (area > 0.01) {
      output = (Math.round(area * decimalHelper) / decimalHelper) +
                ' m<sup>2</sup>';
    } else {
      output = (Math.round(area * 1000000 * decimalHelper) / decimalHelper) +
                ' mm<sup>2</sup>';
    }
    return output;
  }

  /**
   * Determine the angle between two coordinates. The angle will be between
   * -180° and 180°, with 0° being in the east. The angle will increase
   * counter-clockwise.
   *
   * Inspired by https://stackoverflow.com/a/31136507
   *
   * @param {Array<number>} start The start coordinates of the line with the
   *     x-coordinate being at index `0` and y-coordinate being at index `1`.
   * @param {Array<number>} end The end coordinates of the line with the
   *     x-coordinate being at index `0` and y-coordinate being at index `1`.
   *
   * @return {number} the angle in degrees, ranging from -180° to 180°.
   */
  static angle(start: number[], end: number[]): number {
    const dx = start[0] - end[0];
    const dy = start[1] - end[1];
    // range (-PI, PI]
    let theta = Math.atan2(dy, dx);
    // rads to degs, range (-180, 180]
    theta *= 180 / Math.PI;
    return theta;
  }

  /**
   * Determine the angle between two coordinates. The angle will be between
   * 0° and 360°, with 0° being in the east. The angle will increase
   * counter-clockwise.
   *
   * Inspired by https://stackoverflow.com/a/31136507
   *
   * @param {Array<number>} start The start coordinates of the line with the
   *     x-coordinate being at index `0` and y-coordinate being at index `1`.
   * @param {Array<number>} end The end coordinates of the line with the
   *     x-coordinate being at index `0` and y-coordinate being at index `1`.
   *
   * @return {number} the angle in degrees, ranging from 0° and 360°.
   */
  static angle360(start: number[], end: number[]): number {
    // range (-180, 180]
    let theta = MeasureUtil.angle(start, end);
    if (theta < 0) {
      // range [0, 360)
      theta = 360 + theta;
    }
    return theta;
  }

  /**
   * Given an angle between 0° and 360° this angle returns the exact opposite
   * of the angle, e.g. for 90° you'll get back 270°. This effectively turns
   * the direction of the angle from counter-clockwise to clockwise.
   *
   * @param {number} angle360 The input angle obtained counter-clockwise.
   *
   * @return {number} The clockwise angle.
   */
  static makeClockwise(angle360: number): number {
    return 360 - angle360;
  }

  /**
   * This methods adds an offset of 90° to an counter-clockwise increasing
   * angle of a line so that the origin (0°) lies at the top (in the north).
   *
   * @param {number} angle360 The input angle obtained counter-clockwise, with
   *     0° degrees being in the east.
   *
   * @return {number} The adjusted angle, with 0° being in the north.
   */
  static makeZeroDegreesAtNorth(angle360: number): number {
    let corrected = angle360 + 90;
    if (corrected > 360) {
      corrected = corrected - 360;
    }
    return corrected;
  }

  /**
   * Returns the angle of the passed linestring in degrees, with 'N' being the
   * 0°-line and the angle increases in clockwise direction.
   *
   * @param {OlGeomLineString} line The linestring to get the
   *   angle from. As this line is coming from our internal draw
   *   interaction, we know that it will only consist of two points.
   * @param {number} decimalPlacesInToolTips How many decimal places will be
   *   allowed for the measure tooltips.
   *
   * @return {string} The formatted angle of the line.
   */
  static formatAngle(line: OlGeomLineString, decimalPlacesInToolTips: number = 2): string {
    const coords = line.getCoordinates();
    const numCoords = coords.length;
    if (numCoords < 2) {
      return '';
    }

    const lastPoint = coords[numCoords - 1];
    const prevPoint = coords[numCoords - 2];
    let angle = MeasureUtil.angle360(prevPoint, lastPoint);

    angle = MeasureUtil.makeZeroDegreesAtNorth(angle);
    angle = MeasureUtil.makeClockwise(angle);

    return `${angle.toFixed(decimalPlacesInToolTips)}°`;
  }

}

export default MeasureUtil;
