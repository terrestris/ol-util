import OlWMSCapabilities from 'ol/format/WMSCapabilities';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlLayerImage from 'ol/layer/Image';

import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';
import Logger from '@terrestris/base-util/dist/Logger';

import LayerUtil from '../LayerUtil/LayerUtil';

/**
 * Helper class to parse capabilities of WMS layers
 *
 * @class CapabilitiesUtil
 */
class CapabilitiesUtil {

  /**
   * Fetches and parses the WMS Capabilities document for the given URL.
   *
   * @param {string} capabilitiesUrl Url to WMS capabilities document.
   * @return {Object} An object representing the WMS capabilities.
   */
  static async getWmsCapabilities(capabilitiesUrl) {
    try {
      const capabilitiesResponse = await fetch(capabilitiesUrl);

      if (!capabilitiesResponse.ok) {
        Logger.error('Could not get Capabilities');
        return;
      }

      const wmsCapabilitiesParser = new OlWMSCapabilities();

      const capabilitiesText = await capabilitiesResponse.text();

      const capabilities = wmsCapabilitiesParser.read(capabilitiesText);

      return capabilities;
    } catch (error) {
      Logger.error(`Error while reading Capabilities: ${error}`);
    }
  }

  /**
   * Fetches and parses the WMS Capabilities document for the given layer.
   *
   * @param {ol.layer.Layer} layer The layer to the get the Capabilites for.
   * @return {Object} An object representing the WMS capabilities.
   */
  static async getWmsCapabilitiesByLayer(layer) {
    const capabilitiesUrl = this.getCapabilitiesUrl(layer);

    return await this.getWmsCapabilities(capabilitiesUrl);
  }

  /**
   * @param {string} capabilitiesUrl Url to WMS capabilities document
   * @return {Object} An object representing the WMS capabilities.
   * @deprecated Please make use of #getWmsCapabilities
   */
  static async parseWmsCapabilities(capabilitiesUrl) {
    return await this.getWmsCapabilities(capabilitiesUrl);
  }

  /**
   * Returns the Capabilities URL for the given layer.
   *
   * @param {ol.layer.Layer} layer The layer to the get the Capabilities URL for.
   * @return {string} The Capabilities URL.
   */
  static getCapabilitiesUrl(layer) {
    const layerSource = layer.getSource();
    const layerBaseUrl = LayerUtil.getLayerUrl(layer);
    const wmsVersion = layerSource.getParams().VERSION || '1.3.0';

    const getCapabilitiesUrl = UrlUtil.createValidGetCapabilitiesRequest(
      layerBaseUrl, 'WMS', wmsVersion);

    return getCapabilitiesUrl;
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
