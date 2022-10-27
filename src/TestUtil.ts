import _isNil from 'lodash/isNil';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlLayerVector from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import OlMapBrowserEvent from 'ol/MapBrowserEvent';
import { MapOptions } from 'ol/PluggableMap';
import OlSourceVector from 'ol/source/Vector';
import OlView from 'ol/View';

/**
 * A set of some useful static helper methods.
 *
 * @class
 */
export class TestUtil {

  static mapDivId = 'map';
  static mapDivHeight = 256;
  static mapDivWidth = 256;

  /**
   * Creates and applies a map <div> element to the body.
   *
   * @return {HTMLElement} The mounted <div> element.
   */
  static mountMapDiv = () => {
    var div = document.createElement('div');
    var style = div.style;

    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = TestUtil.mapDivWidth + 'px';
    style.height = TestUtil.mapDivHeight + 'px';
    div.id = TestUtil.mapDivId;

    document.body.appendChild(div);

    return div;
  };

  /**
   * Removes the map div element from the body.
   */
  static unmountMapDiv = () => {
    let div = document.querySelector(`div#${TestUtil.mapDivId}`);
    if (!div) {
      return;
    }
    let parent = div.parentNode;
    if (parent) {
      parent.removeChild(div);
    }
    div = null;
  };

  /**
   * Creates an OpenLayers map.
   *
   * @param {MapOptions & { resolutions: number[] }} mapOpts Additional options for the map to create.
   * @return {OlMap} The ol map.
   */
  static createMap = (mapOpts?: MapOptions & { resolutions: number[] }) => {
    let source = new OlSourceVector();
    let layer = new OlLayerVector({source: source});
    let targetDiv = TestUtil.mountMapDiv();
    let defaultMapOpts = {
      target: targetDiv,
      layers: [layer],
      view: new OlView({
        center: [829729, 6708850],
        resolution: 1,
        resolutions: mapOpts?.resolutions
      })
    };

    Object.assign(defaultMapOpts, mapOpts);
    const map = new OlMap(defaultMapOpts);
    map.renderSync();
    return map;
  };

  /**
   * Removes the map.
   *
   * @param {OlMap} map
   */
  static removeMap = (map: OlMap) => {
    map?.dispose();
    TestUtil.unmountMapDiv();
  };

  /**
   * Simulates a browser pointer event on the map viewport.
   * Origin: https://github.com/openlayers/openlayers/blob/master/test/spec/ol/interaction/draw.test.js#L67
   *
   * @param {OlMap} map The map to use.
   * @param {string} type Event type.
   * @param {number} x Horizontal offset from map center.
   * @param {number} y Vertical offset from map center.
   * @param {boolean} shift Shift key is pressed
   * @param {boolean} dragging Whether the map is being dragged or not.
   */
  static simulatePointerEvent = (map: OlMap, type: string, x: number, y: number, shift: boolean, dragging: boolean) => {
    let viewport = map.getViewport();
    // Calculated in case body has top < 0 (test runner with small window).
    let position = viewport.getBoundingClientRect();
    const event = new MouseEvent(type);
    // @ts-ignore
    event.clientX = position.left + x + TestUtil.mapDivWidth / 2;
    // @ts-ignore
    event.clientY = position.top + y + TestUtil.mapDivHeight / 2;
    // @ts-ignore
    event.shiftKey = shift;
    map.handleMapBrowserEvent(new OlMapBrowserEvent(type, map, event, dragging));
  };

  /**
   * Creates and returns an empty vector layer.
   *
   * @param {Object} properties The properties to set.
   * @return {OlLayerVector<OlSourceVector>} The layer.
   */
  static createVectorLayer = (properties?: {
    [key: string]: any;
  }) => {
    const source = new OlSourceVector();
    const layer = new OlLayerVector({source: source});

    if (!_isNil(properties)) {
      layer.setProperties(properties);
    }
    return layer;
  };

  /**
   * Returns a point feature with a random position.
   * @type {Object}
   */
  static generatePointFeature = ((props = {
    ATTR_1: Math.random() * 100,
    ATTR_2: 'Borsigplatz 9',
    ATTR_3: 'Dortmund'
  }) => {
    const coords = [
      Math.floor(Math.random() * 180) - 180,
      Math.floor(Math.random() * 90) - 90
    ];
    const geom = new OlGeomPoint(coords);
    const feat = new OlFeature({
      geometry: geom
    });

    feat.setProperties(props);

    return feat;
  });

}

export default TestUtil;
