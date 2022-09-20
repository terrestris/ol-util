import TileLayer from 'ol/layer/Tile';
import OlLayerGroup from 'ol/layer/Group';
import MapUtil from '../MapUtil/MapUtil';
import {getUid} from 'ol';
import _isNil from 'lodash/isNil';
import _isEmpty from 'lodash/isEmpty';

/**
 * Helper class for some operations related to permalink function.
 *
 * @class
 */
export class PermalinkUtil {

  /**
   * Creates a permalink based on the given map state. It will contain
   * the current view state of the map (center and zoom) as well as
   * the current (filtered) list of layers.
   *
   * @param {import("ol/Map").default} map The OpenLayers map
   * @param {string} separator The separator for the layers list and center
   *                           coordinates in the link. Default is to ';'.
   * @param {(layer: import("ol/layer/Base").default) => string} identifier Function to generate the identifier of the
   *                              layer in the link. Default is the name
   *                              (given by the associated property) of
   *                              the layer.
   * @param {(layer: import("ol/layer/Base").default) => boolean} filter Function to filter layers that should be
   *                          added to the link. Default is to add all
   *                          visible layers of type ol/layer/Tile.
   * @param {string[]} customAttributes Custom layer attributes which will be saved in the permalink for each layer.
   * @return {string} The permalink.
   */
  static getLink = (
    map,
    separator = ';',
    identifier = l => l.get('name'),
    filter = l => l instanceof TileLayer && l.getVisible(),
    customAttributes = []
  ) => {
    const center = map.getView().getCenter()?.join(separator) ?? '';
    const zoom = map.getView().getZoom()?.toString() ?? '';
    const layers = MapUtil.getAllLayers(map);
    const visibles = layers
      .filter(filter)
      .map(identifier)
      .join(separator);
    const link = new URL(window.location.href);

    if (customAttributes.length > 0) {
      /** @type {{}[]} */
      const customLayerAttributes = [];
      layers.forEach((layer) => {
        /** @type {any} */
        const config = {};
        customAttributes.forEach((attribute) => {
          if (!_isNil(layer.get(attribute))) {
            config[attribute] = layer.get(attribute);
          }
        });
        if (!_isEmpty(config)) {
          customLayerAttributes.push(config);
        }
      });
      const customLayerAttributesString = JSON.stringify(customLayerAttributes);
      link.searchParams.set('customLayerAttributes', customLayerAttributesString);
    }

    link.searchParams.set('center', center);
    link.searchParams.set('zoom', zoom);
    link.searchParams.set('layers', visibles);

    return link.href;
  };

  /**
   * Applies an existing permalink to the given map.
   *
   * @param {import("ol/Map").default} map The OpenLayers map.
   * @param {string} separator The separator of the layers list and center
   *                           coordinates in the link. Default is to ';'.
   * @param {(layer: import("ol/layer/Base").default) => string} identifier Function to generate the identifier of the
   *                              layer in the link. Default is the name
   *                              (given by the associated property) of
   *                              the layer.
   * @param {(layer: import("ol/layer/Base").default) => boolean} filter Function to filter layers that should be
   *                          handled by the link. Default is to consider all
   *                          current map layers of type ol/layer/Tile.
   * @return {string | null} The customLayerAttributes, if defined. Otherwise null.
   */
  static applyLink = (map, separator = ';', identifier = l => l.get('name'),
    filter = l => l instanceof TileLayer) => {
    const url = new URL(window.location.href);
    const center = url.searchParams.get('center');
    const zoom = url.searchParams.get('zoom');
    const layers = url.searchParams.get('layers');
    const customLayerAttributes = url.searchParams.get('customLayerAttributes');
    const allLayers = MapUtil.getAllLayers(map);

    if (layers) {
      const layersSplitted = layers.split(separator);
      allLayers
        .filter(filter)
        .forEach(l => {
          const visible = layersSplitted.includes(identifier(l));
          l.setVisible(visible);
          // also make all parent folders / groups visible so
          // that the layer becomes visible in map
          if (visible) {
            PermalinkUtil.setParentsVisible(
              map,
              map.getLayerGroup().getLayers(),
              getUid(l));
          }
        });
    }

    if (center) {
      map.getView().setCenter([
        parseFloat(center.split(separator)[0]),
        parseFloat(center.split(separator)[1])
      ]);
    }

    if (zoom) {
      map.getView().setZoom(parseInt(zoom, 10));
    }

    if (customLayerAttributes) {
      return customLayerAttributes;
    }
    return null;
  };

  /**
   * Search through the given Ol-Collection for the given id and
   * set all parenting groups visible.
   * @param {import("ol/Map").default} map The openlayers map
   * @param {import("ol/Collection").default<import("ol/layer/Base").default>} coll The Openlayers Collection
   * @param {string} id Ther layer ol uid to search for
   */
  static setParentsVisible = (map, coll, id) => {
    coll.forEach(el => {
      if (el instanceof OlLayerGroup) {
        const layers = MapUtil.getLayersByGroup(map, el);
        if (layers.map(layer => getUid(layer)).includes(id)) {
          el.setVisible(true);
        }
        PermalinkUtil.setParentsVisible(map, el.getLayers(), id);
      }
    });
  };

}

export default PermalinkUtil;
