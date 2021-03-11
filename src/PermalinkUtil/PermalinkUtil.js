import TileLayer from 'ol/layer/Tile';
import MapUtil from '../MapUtil/MapUtil';

/**
 * Helper class for some operations related to permalink function.
 *
 * @class
 */
export class PermalinkUtil {

  /**
   * Creates a permalink based on the given map state
   * Permalink will contain center, zoom and layers, using semicolon as
   * separator for arrays
   * @param {Object} map The openlayers map
   * @param {string} separator Optional string used as separator
   * @return {string} The permalink.
   */
  static getLink = (map, separator) => {
    const center = map.getView().getCenter().join(separator ? separator : ';');
    const zoom = map.getView().getZoom();
    const layers = MapUtil.getAllLayers(map);
    const visibles = layers
      .filter((l) => l instanceof TileLayer && l.getVisible())
      .map((l) => l.get('name'))
      .join(separator ? separator : ';');
    const link = new URL(window.location.href);

    link.searchParams.set('center', center);
    link.searchParams.set('zoom', zoom.toString());
    link.searchParams.set('layers', visibles);

    return link.href;
  };

  /**
   * Apply an existing permalink to the given map
   * @param {Object} map The openlayers map
   * @param {string} separator Optional string used as separator
   */
  static applyLink = (map, separator) => {
    const url = new URL(window.location.href);
    const center = url.searchParams.get('center');
    const zoom = url.searchParams.get('zoom');
    const layers = url.searchParams.get('layers');
    const allLayers = MapUtil.getAllLayers(map);

    if (layers) {
      allLayers.filter((l) => l instanceof TileLayer)
        .forEach((l) => {
          l.setVisible(layers.includes(l.get('name')));
        });
    }

    if (center) {
      map.getView().setCenter([
        parseFloat(center.split(separator ? separator : ';')[0]),
        parseFloat(center.split(separator ? separator : ';')[1])
      ]);
    }

    if (zoom) {
      map.getView().setZoom(parseInt(zoom, 10));
    }
  };
}

export default PermalinkUtil;
