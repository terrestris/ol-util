import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerLayer from 'ol/layer/Layer';
import OlGeomGeometryCollection from 'ol/geom/GeometryCollection';
import {METERS_PER_UNIT} from 'ol/proj/Units';
import {getUid} from 'ol/util';

import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';

import FeatureUtil from '../FeatureUtil/FeatureUtil';

import findIndex from 'lodash/findIndex';
import _isString from 'lodash/isString';

/**
 * Helper class for the OpenLayers map.
 *
 * @class
 */
export class MapUtil {

  /**
   * Returns all interactions by the given name of a map.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {string} name The name of the interaction to look for.
   * @return {import("ol/interaction/Interaction").default[]} The list of result interactions.
   */
  static getInteractionsByName(map, name) {
    return map.getInteractions()
      .getArray()
      .filter(interaction => interaction.get('name') === name);
  }

  /**
   * Returns all interactions of the given class of the passed map.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {typeof import("ol/interaction/Interaction").default} clazz The class of the interaction to look for.
   * @return {import("ol/interaction/Interaction").default[]} The list of result interactions.
   */
  static getInteractionsByClass(map, clazz) {
    return map.getInteractions()
      .getArray()
      .filter(interaction => interaction instanceof clazz);
  }

  /**
   * Calculates the appropriate map resolution for a given scale in the given
   * units.
   *
   * See: https://gis.stackexchange.com/questions/158435/
   * how-to-get-current-scale-in-openlayers-3
   *
   * @method
   * @param {number|string} scale The input scale to calculate the appropriate
   *                       resolution for.
   * @param {string} units The units to use for calculation (m or degrees).
   * @return {number} The calculated resolution.
   */
  static getResolutionForScale (scale, units) {
    let dpi = 25.4 / 0.28;
    let mpu = METERS_PER_UNIT[units];
    let inchesPerMeter = 39.37;

    return (_isString(scale) ? parseFloat(scale) : scale) / (mpu * inchesPerMeter * dpi);
  }

  /**
   * Returns the appropriate scale for the given resolution and units.
   *
   * @method
   * @param {number|string} resolution The resolutions to calculate the scale for.
   * @param {string} units The units the resolution is based on, typically
   *                       either 'm' or 'degrees'.
   * @return {number} The appropriate scale.
   */
  static getScaleForResolution (resolution, units) {
    var dpi = 25.4 / 0.28;
    var mpu = METERS_PER_UNIT[units];
    var inchesPerMeter = 39.37;

    return (_isString(resolution) ? parseFloat(resolution) : resolution) * mpu * inchesPerMeter * dpi;
  }

  /**
   * Returns all layers of a collection. Even the hidden ones.
   *
   * @param {import("ol/Map").default|import("ol/layer/Group").default} collection The collection to get the layers
   *                                           from. This can be an ol.layer.Group
   *                                           or an ol.Map.
   * @param {(layer: import("ol/layer/Base").default) => boolean} [filter] A filter function that receives the layer.
   *                            If it returns true it will be included in the
   *                            returned layers.
   * @return {import("ol/layer/Base").default[]} An array of all Layers.
   */
  static getAllLayers(collection, filter = () => true) {
    var layers = collection.getLayers().getArray();

    return layers.flatMap(function(layer) {
      /** @type {import("ol/layer/Base").default[]} */
      let layers = [];
      if (layer instanceof OlLayerGroup) {
        layers = MapUtil.getAllLayers(layer, filter);
      }
      if (filter(layer)) {
        layers.push(layer);
      }
      return layers;
    });
  }

  /**
   * Get a layer by its key (ol_uid).
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {string} ol_uid The ol_uid of a layer.
   * @return {import("ol/layer/Base").default|undefined} The layer.
   */
  static getLayerByOlUid = (map, ol_uid) => {
    const layers = MapUtil.getAllLayers(map);
    return layers.find((l) => {
      return ol_uid === getUid(l).toString();
    });
  };

  /**
   * Returns the layer from the provided map by the given name.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {string} name The name to get the layer by.
   * @return {import("ol/layer/Base").default} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByName(map, name) {
    const layers = MapUtil.getAllLayers(map);
    return layers.filter((layer) => {
      return layer.get('name') === name;
    })[0];
  }

  /**
   * Returns the layer from the provided map by the given name
   * (parameter LAYERS).
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {string} name The name to get the layer by.
   * @return {import("../types").WMSLayer|undefined} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByNameParam(map, name) {
    let layers = MapUtil.getAllLayers(map);
    let layerCandidate;

    for (let layer of layers) {
      if (layer instanceof OlLayerLayer) {
        const source = layer.getSource();
        if (source instanceof OlSourceImageWMS || source instanceof OlSourceTileWMS) {
          if (layer.getSource().getParams()['LAYERS'] === name) {
            layerCandidate = layer;
            break;
          }
        }
      }
    }

    return layerCandidate;
  }

  /**
   * Returns the layer from the provided map by the given feature.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {import("ol/Feature").default} feature The feature to get the layer by.
   * @param {string[]} namespaces list of supported GeoServer namespaces.
   * @return {import("ol/layer/Base").default|undefined} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByFeature(map, feature, namespaces) {
    let featureTypeName = FeatureUtil.getFeatureTypeName(feature);

    for (let namespace of namespaces) {
      let qualifiedFeatureTypeName = `${namespace}:${featureTypeName}`;
      let layer = MapUtil.getLayerByNameParam(map, qualifiedFeatureTypeName);
      if (layer) {
        return layer;
      }
    }

    return undefined;
  }

  /**
   * Returns all layers of the specified layer group recursively.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {import("ol/layer/Group").default} layerGroup The group to flatten.
   * @return {import("ol/layer/Layer").default[]} The (flattened) layers from the group
   */
  static getLayersByGroup(map, layerGroup) {
    return layerGroup.getLayers().getArray().flatMap((layer) => {
      if (layer instanceof OlLayerGroup) {
        return MapUtil.getLayersByGroup(map, layer);
      } else {
        return [/** @type {import("ol/layer/Layer").default} */ (layer)];
      }
    });
  }

  /**
   * Returns the list of layers matching the given pair of properties.
   *
   * @param {import("ol/Map").default} map The map to use for lookup.
   * @param {string} key The property key.
   * @param {Object} value The property value.
   *
   * @return {import("ol/layer/Base").default[]} The array of matching layers.
   */
  static getLayersByProperty(map, key, value) {
    const mapLayers = MapUtil.getAllLayers(map);
    return mapLayers.filter(l => l.get(key) === value);
  }

  /**
   * Get information about the LayerPosition in the tree.
   *
   * @param {import("ol/layer/Base").default} layer The layer to get the information.
   * @param {import("ol/layer/Group").default|import("ol/Map").default} groupLayerOrMap The groupLayer or map
   *                                                  containing the layer.
   * @return {{
   *   groupLayer: import("ol/layer/Group").default,
   *   position: number
   * }} The groupLayer containing the layer and the position of the layer in the collection.
   */
  static getLayerPositionInfo(layer, groupLayerOrMap) {
    const groupLayer = groupLayerOrMap instanceof OlLayerGroup
      ? groupLayerOrMap
      : groupLayerOrMap.getLayerGroup();
    const layers = groupLayer.getLayers().getArray();
    let info = {};

    if (layers.indexOf(layer) < 0) {
      layers.forEach((childLayer) => {
        if (childLayer instanceof OlLayerGroup && !info.groupLayer) {
          info = MapUtil.getLayerPositionInfo(layer, childLayer);
        }
      });
    } else {
      info.position = layers.indexOf(layer);
      info.groupLayer = groupLayer;
    }
    return info;
  }

  /**
   * Get the getlegendGraphic url of a layer. Designed for geoserver.
   * Currently supported Sources:
   *  - ol.source.TileWms (with url configured)
   *  - ol.source.ImageWms (with url configured)
   *
   * @param {import("../types").WMSLayer} layer The layer that you want to have a legendUrl for.
   * @param {Object} extraParams
   * @return {string} The getLegendGraphicUrl.
   */
  static getLegendGraphicUrl(layer, extraParams = {}) {
    const source = layer.getSource();

    if (!source) {
      throw new Error('Layer has no source.');
    }

    const url = (source instanceof OlSourceTileWMS
      ? source.getUrls()?.[0]
      : source.getUrl())
      ?? '';
    const params = {
      LAYER: source.getParams().LAYERS,
      VERSION: '1.3.0',
      SERVICE: 'WMS',
      REQUEST: 'getLegendGraphic',
      FORMAT: 'image/png'
    };

    const queryString = UrlUtil.objectToRequestString(
      Object.assign(params, extraParams));

    return /\?/.test(url) ? `${url}&${queryString}` : `${url}?${queryString}`;
  }

  /**
   * Checks whether the resolution of the passed map's view lies inside of the
   * min- and max-resolution of the passed layer, e.g. whether the layer should
   * be displayed at the current map view resolution.
   *
   * @param {import("ol/layer/Base").default} layer The layer to check.
   * @param {import("ol/Map").default} map The map to get the view resolution for comparison
   *     from.
   * @return {boolean} Whether the resolution of the passed map's view lies
   *     inside of the min- and max-resolution of the passed layer, e.g. whether
   *     the layer should be displayed at the current map view resolution. Will
   *     be `false` when no `layer` or no `map` is passed or if the view of the
   *     map is falsy or does not have a resolution (yet).
   */
  static layerInResolutionRange(layer, map) {
    const mapView = map && map.getView();
    const currentRes = mapView && mapView.getResolution();
    if (!layer || !mapView || !currentRes) {
      // It is questionable what we should return in this case, I opted for
      // false, since we cannot sanely determine a correct answer.
      return false;
    }
    const layerMinRes = layer.getMinResolution(); // default: 0 if unset
    const layerMaxRes = layer.getMaxResolution(); // default: Infinity if unset
    // minimum resolution is inclusive, maximum resolution exclusive
    return currentRes >= layerMinRes && currentRes < layerMaxRes;
  }


  /**
   * Rounds a scalenumber in dependency to its size.
   *
   * @param  {number} scale The exact scale
   * @return {number} The roundedScale
   */
  static roundScale(scale) {
    if (scale < 100) {
      return Math.round(scale);
    }
    if (scale >= 100 && scale < 10000 ) {
      return Math.round(scale / 10) * 10;
    }
    if (scale >= 10000 && scale < 1000000 ) {
      return Math.round(scale / 100) * 100;
    }
    // scale >= 1000000
    return Math.round(scale / 1000) * 1000;
  }

  /**
   * Returns the appropriate zoom level for the given scale and units.

   * @method
   * @param {number} scale Map scale to get the zoom for.
   * @param {number[]} resolutions Resolutions array.
   * @param {string} units The units the resolutions are based on, typically
   *                       either 'm' or 'degrees'. Default is 'm'.
   *
   * @return {number} Determined zoom level for the given scale.
   */
  static getZoomForScale(scale, resolutions, units = 'm') {
    if (Number.isNaN(Number(scale))) {
      return 0;
    }

    if (scale < 0) {
      return 0;
    }

    let calculatedResolution = MapUtil.getResolutionForScale(scale, units);
    let closestVal = resolutions.reduce((prev, curr) => {
      return Math.abs(curr - calculatedResolution) < Math.abs(prev - calculatedResolution)
        ? curr
        : prev;
    });
    return findIndex(resolutions, function (o) {
      return Math.abs(o - closestVal) <= 1e-10;
    });
  }

  /**
   * Fits the map's view to the extent of the passed features.
   *
   * @param {import("ol/Map").default} map The map to get the view from.
   * @param {import("ol/Feature").default[]} features The features to zoom to.
   */
  static zoomToFeatures(map, features) {
    const featGeometries = FeatureUtil.mapFeaturesToGeometries(features);

    if (featGeometries.length > 0) {
      const geomCollection = new OlGeomGeometryCollection(featGeometries);
      map.getView().fit(geomCollection.getExtent());
    }
  }

  /**
   * Checks if the given layer is visible for the given resolution.
   *
   * @param {import("ol/layer/Base").default} layer The layer.
   * @param {number} resolution The resolution of the map
   */
  static isInScaleRange(layer, resolution) {
    return resolution >= layer.get('minResolution')
      && resolution < layer.get('maxResolution');
  }
}

export default MapUtil;
