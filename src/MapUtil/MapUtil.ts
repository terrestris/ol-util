import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';
import { isNil } from 'lodash';
import findIndex from 'lodash/findIndex';
import _isFinite from 'lodash/isFinite';
import _isString from 'lodash/isString';
import OlFeature from 'ol/Feature';
import OlGeometry from 'ol/geom/Geometry';
import OlGeomGeometryCollection from 'ol/geom/GeometryCollection';
import OlBaseLayer from 'ol/layer/Base';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerImage from 'ol/layer/Image';
import OlLayerTile from 'ol/layer/Tile';
import OlMap from 'ol/Map';
import { toLonLat } from 'ol/proj';
import { METERS_PER_UNIT } from 'ol/proj/Units';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import { getUid } from 'ol/util';

import FeatureUtil from '../FeatureUtil/FeatureUtil';
import LayerUtil from '../LayerUtil/LayerUtil';

export type LayerPositionInfo = {
  position?: number;
  groupLayer?: OlLayerGroup;
};

/**
 * Helper class for the OpenLayers map.
 *
 * @class
 */
export class MapUtil {

  /**
   * Returns all interactions by the given name of a map.
   *
   * @param {OlMap} map The map to use for lookup.
   * @param {string} name The name of the interaction to look for.
   * @return The list of result interactions.
   */
  static getInteractionsByName(map: OlMap, name: string) {
    return map.getInteractions()
      .getArray()
      .filter(interaction => interaction.get('name') === name);
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
  static getResolutionForScale (scale: number | string, units: string): number {
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
  static getScaleForResolution (resolution: number | string, units: string): number {
    var dpi = 25.4 / 0.28;
    var mpu = METERS_PER_UNIT[units];
    var inchesPerMeter = 39.37;

    return (_isString(resolution) ? parseFloat(resolution) : resolution) * mpu * inchesPerMeter * dpi;
  }

  /**
   * Returns all layers of a collection. Even the hidden ones.
   *
   * @param {OlMap | OlLayerGroup} collection The collection to get the layers
   *                                           from. This can be an ol.layer.Group
   *                                           or an ol.Map.
   * @param {(olLayer: OlBaseLayer) => boolean} [filter] A filter function that receives the layer.
   *                            If it returns true it will be included in the
   *                            returned layers.
   * @return {OlBaseLayer} An array of all Layers.
   */
  static getAllLayers(
    collection: OlMap | OlLayerGroup,
    filter: (olLayer: OlBaseLayer) => boolean = () => true
  ): OlBaseLayer[] {
    const layers = collection.getLayers().getArray();
    return layers.flatMap((layer: OlBaseLayer) => {
      let ll: OlBaseLayer[] = [];
      if (layer instanceof OlLayerGroup) {
        ll = MapUtil.getAllLayers(layer, filter);
      }
      if (filter(layer)) {
        ll.push(layer);
      }
      return ll;
    });
  }

  /**
   * Get a layer by its key (ol_uid).
   *
   * @param {OlMap} map The map to use for lookup.
   * @param olUid
   * @return {OlBaseLayer|undefined} The layer.
   */
  static getLayerByOlUid = (map: OlMap, olUid: string): OlBaseLayer | undefined => {
    const layers = MapUtil.getAllLayers(map);
    return layers.find((l) => {
      return olUid === getUid(l).toString();
    });
  };

  /**
   * Returns the layer from the provided map by the given name.
   *
   * @param {OlMap} map The map to use for lookup.
   * @param {string} name The name to get the layer by.
   * @return {OlBaseLayer} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByName(map: OlMap, name: string): OlBaseLayer {
    const layers = MapUtil.getAllLayers(map);
    return layers.filter((layer) => {
      return layer.get('name') === name;
    })[0];
  }

  /**
   * Returns the layer from the provided map by the given name
   * (parameter LAYERS).
   *
   * @param {OlMap} map The map to use for lookup.
   * @param {string} name The name to get the layer by.
   * @return {OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS>|undefined}
   * The result layer or undefined if the layer could not be found.
   */
  static getLayerByNameParam(
    map: OlMap,
    name: string
  ): OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS> | undefined {
    let layers = MapUtil.getAllLayers(map);
    let layerCandidate: OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS> | undefined;

    for (let layer of layers) {
      if (layer instanceof OlLayerTile || layer instanceof OlLayerImage<OlSourceImageWMS>) {
        const source = layer.getSource();
        if (source instanceof OlSourceImageWMS || source instanceof OlSourceTileWMS) {
          if (layer.getSource().getParams().LAYERS === name) {
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
   * @param {OlMap} map The map to use for lookup.
   * @param {OlFeature<OlGeometry>} feature The feature to get the layer by.
   * @param {string[]} namespaces list of supported GeoServer namespaces.
   * @return {OlBaseLayer|undefined} The result layer or undefined if the layer could not
   *                    be found.
   */
  static getLayerByFeature(map: OlMap, feature: OlFeature<OlGeometry>, namespaces: string[]): OlBaseLayer | undefined {
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
   * @param {OlMap} map The map to use for lookup.
   * @param {OlLayerGroup} layerGroup The group to flatten.
   * @return {OlBaseLayer} The (flattened) layers from the group
   */
  static getLayersByGroup(map: OlMap, layerGroup: OlLayerGroup): OlBaseLayer[] {
    return layerGroup.getLayers().getArray()
      .flatMap((layer: OlBaseLayer) => {
        if (layer instanceof OlLayerGroup) {
          return MapUtil.getLayersByGroup(map, layer);
        } else {
          return [layer];
        }
      });
  }

  /**
   * Returns the list of layers matching the given pair of properties.
   *
   * @param {OlMap} map The map to use for lookup.
   * @param {string} key The property key.
   * @param {Object} value The property value.
   *
   * @return {OlBaseLayer[]} The array of matching layers.
   */
  static getLayersByProperty(map: OlMap, key: string, value: any) {
    const mapLayers = MapUtil.getAllLayers(map);
    return mapLayers.filter(l => l.get(key) === value);
  }

  /**
   * Get information about the LayerPosition in the tree.
   *
   * @param {OlBaseLayer} layer The layer to get the information.
   * @param {OlLayerGroup|OlMap} groupLayerOrMap The groupLayer or map
   *                                                  containing the layer.
   * @return {{
   *   groupLayer: OlLayerGroup,
   *   position: number
   * }} The groupLayer containing the layer and the position of the layer in the collection.
   */
  static getLayerPositionInfo(layer: OlBaseLayer, groupLayerOrMap: OlMap | OlLayerGroup): LayerPositionInfo {
    const groupLayer = groupLayerOrMap instanceof OlLayerGroup
      ? groupLayerOrMap
      : groupLayerOrMap.getLayerGroup();
    const layers = groupLayer.getLayers().getArray();
    let info: LayerPositionInfo = {};

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
   * @param {OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS>} layer The layer that you want to have a
   * legendUrl for.
   * @param {Object} extraParams
   * @return {string} The getLegendGraphicUrl.
   */
  static getLegendGraphicUrl(
    layer: OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS>,
    extraParams: {
      [key: string]: string | number;
    } = {}
  ): string {
    const source = layer.getSource();

    if (!source || !(source instanceof OlSourceTileWMS || source instanceof OlSourceImageWMS)) {
      throw new Error('Layer has no or unexpected source.');
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
   * @param {OlBaseLayer} layer The layer to check.
   * @param {OlMap} map The map to get the view resolution for comparison
   *     from.
   * @return {boolean} Whether the resolution of the passed map's view lies
   *     inside of the min- and max-resolution of the passed layer, e.g. whether
   *     the layer should be displayed at the current map view resolution. Will
   *     be `false` when no `layer` or no `map` is passed or if the view of the
   *     map is falsy or does not have a resolution (yet).
   */
  static layerInResolutionRange(layer?: OlBaseLayer, map?: OlMap): boolean {
    const mapView = map?.getView();
    const currentRes = mapView?.getResolution();
    if (isNil(layer) || !mapView || !currentRes) {
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
   * Rounds a scale number depending on its size.
   *
   * @param  {number} scale The exact scale
   * @return {number} The roundedScale
   */
  static roundScale(scale: number): number {
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
  static getZoomForScale(scale: number, resolutions: number[], units: string = 'm'): number {
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
   * @param {OlMap} map The map to get the view from.
   * @param {OlFeature[]} features The features to zoom to.
   */
  static zoomToFeatures(map: OlMap, features: OlFeature[]) {
    const featGeometries = FeatureUtil.mapFeaturesToGeometries(features);

    if (featGeometries.length > 0) {
      const geomCollection = new OlGeomGeometryCollection(featGeometries);
      map.getView().fit(geomCollection.getExtent());
    }
  }

  /**
   * Checks if the given layer is visible for the given resolution.
   *
   * @param {OlBaseLayer} layer The layer.
   * @param {number} resolution The resolution of the map
   */
  static isInScaleRange(layer: OlBaseLayer, resolution: number) {
    return resolution >= layer?.get('minResolution')
      && resolution < layer?.get('maxResolution');
  }

  /**
   * Converts a given OpenLayers map to an inkmap spec. Only returns options which can be
   * derived from a map (center, scale, projection, layers).
   *
   * @param {OlMap} olMap The ol map.
   *
   * @return {Promise<Partial<import("../types").InkmapPrintSpec>>} Promise of the inmkap print spec.
   */
  static async generatePrintConfig(olMap: OlMap) {
    const unit = olMap.getView().getProjection().getUnits();
    const resolution = olMap.getView().getResolution();
    const projection =  olMap.getView().getProjection().getCode();
    if (resolution === undefined) {
      throw new Error('Can not determine resolution from map');
    }

    const scale = MapUtil.getScaleForResolution(resolution, unit);
    const center = olMap?.getView().getCenter();
    if (!unit || !center || !_isFinite(resolution)) {
      throw new Error('Can not determine unit / resolution from map');
    }
    const centerLonLat = toLonLat(center, projection);

    const layerPromises = olMap.getAllLayers()
      .map(LayerUtil.mapOlLayerToInkmap);

    const responses = await Promise.all(layerPromises);
    const layers = responses.filter(l => l !== null);
    // ignore typecheck because responses.filter(l => l !== null) is not recognized properly
    return {
      layers: layers,
      center: centerLonLat,
      scale: scale,
      projection: projection
    };
  }

}

export default MapUtil;
