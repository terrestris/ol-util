import TileLayer from 'ol/layer/Tile';
import OlLayerGroup from 'ol/layer/Group';
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
          const visible = layers.includes(l.get('name'));
          l.setVisible(visible);
          // also make all parent folders / groups visible so
          // that the layer becomes visible in map
          if (visible) {
            PermalinkUtil.setParentsVisible(
              map,
              map.getLayerGroup().getLayers(),
              l.ol_uid);
          }
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

  /**
   * Search through the given Ol-Collection for the given id and
   * set all parenting groups visible.
   * @param {Object} map The openlayers map
   * @param {Object} coll The Openlayers Collection
   * @param {string} id Ther layer ol uid to search for
   */
   static setParentsVisible = (map, coll, id) => {
     coll.forEach(el => {
       if (el instanceof OlLayerGroup) {
         const layers = MapUtil.getLayersByGroup(map, el);
         if (layers.map(layer => layer.ol_uid).includes(id)) {
           el.setVisible(true);
         }
         PermalinkUtil.setParentsVisible(map, el.getLayers(), id);
       }
     });
   };
}

export default PermalinkUtil;
