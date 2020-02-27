import OlWMSCapabilities from 'ol/format/WMSCapabilities';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlLayerImage from 'ol/layer/Image';

import get from 'lodash/get.js';
import isFunction from 'lodash/isFunction';

/**
 * Helper class to parse capabilities of WMS layers
 *
 * @class CapabilitiesUtil
 */
class CapabilitiesUtil {

  /**
   * Parses the given WMS Capabilities string.
   *
   * @param {string} capabilitiesUrl Url to WMS capabilities document
   * @return {Object} An object representing the WMS capabilities.
   */
  static parseWmsCapabilities(capabilitiesUrl) {
    return fetch(capabilitiesUrl)
      .then((response) => response.text())
      .then((data) => {
        const wmsCapabilitiesParser = new OlWMSCapabilities();
        return wmsCapabilitiesParser.read(data);
      });
  }

  /**
   * Returns the layers from a parsed WMS GetCapabilities object.
   *
   * @param {Object} capabilities A capabilities object.
   * @param {string} nameField Configure the field which should be set as the
   *                           'name' property in the openlayers layer.
   * @param {Function} proxyFn Optional proxy function which can be applied to
   *                           `GetMap`, `GetFeatureInfo` and `GetLegendGraphic`
   *                           requests to avoid CORS issues.
   * @return {OlLayerTile[]} Array of OlLayerTile
   */
  static getLayersFromWmsCapabilities(capabilities, nameField = 'Name', proxyFn) {
    const wmsVersion = get(capabilities, 'version');
    const layersInCapabilities = get(capabilities, 'Capability.Layer.Layer');
    const wmsGetMapConfig = get(capabilities, 'Capability.Request.GetMap');
    const wmsGetFeatureInfoConfig = get(capabilities, 'Capability.Request.GetFeatureInfo');
    const getMapUrl = get(wmsGetMapConfig, 'DCPType[0].HTTP.Get.OnlineResource');
    const getFeatureInfoUrl = get(wmsGetFeatureInfoConfig, 'DCPType[0].HTTP.Get.OnlineResource');
    const legendUrl = layersInCapabilities.length > 0
      ? get(layersInCapabilities[0], 'Style[0].LegendURL[0].OnlineResource')
      : null;

    return layersInCapabilities.map(layerObj => {
      const title = get(layerObj, 'Attribution.Title');
      const onlineResource = get(layerObj, 'Attribution.OnlineResource');
      const attributions = [onlineResource ? `<a target="_blank" href="${onlineResource}">${title}</a>` : title];

      return new OlLayerImage({
        opacity: 1,
        title: get(layerObj, 'Title'),
        name: get(layerObj, nameField),
        abstract: get(layerObj, 'Abstract'),
        getFeatureInfoUrl: isFunction(proxyFn) ? proxyFn(getFeatureInfoUrl) : getFeatureInfoUrl,
        getFeatureInfoFormats: get(wmsGetFeatureInfoConfig, 'Format'),
        legendUrl: isFunction(proxyFn) ? proxyFn(legendUrl) : legendUrl,
        queryable: get(layerObj, 'queryable'),
        source: new OlSourceImageWMS({
          url: isFunction(proxyFn) ? proxyFn(getMapUrl) : getMapUrl,
          attributions: attributions,
          params: {
            'LAYERS': get(layerObj, 'Name'),
            'VERSION': wmsVersion
          }
        })
      });
    });
  }
}

export default CapabilitiesUtil;
