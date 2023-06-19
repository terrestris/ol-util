import UrlUtil from '@terrestris/base-util/dist/UrlUtil/UrlUtil';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import OlLayerImage from 'ol/layer/Image';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import { parseStringPromise } from 'xml2js';

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
   * @param {RequestInit} fetchOpts Optional fetch options to make use of
   *                                while requesting the Capabilities.
   * @return {Promise<any>} An object representing the WMS capabilities.
   */
  static async getWmsCapabilities(capabilitiesUrl: string, fetchOpts: RequestInit = {}): Promise<any> {
    const capabilitiesResponse = await fetch(capabilitiesUrl, fetchOpts);

    if (!capabilitiesResponse.ok) {
      throw new Error('Could not get capabilities.');
    }
    const capabilitiesText = await capabilitiesResponse.text();
    return await parseStringPromise(capabilitiesText, {
      trim: true,
      explicitArray: false,
      explicitRoot: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });
  }

  /**
   * Fetches and parses the WMS Capabilities document for the given layer.
   *
   * @param {import("../types").WMSLayer} layer The layer to the get the Capabilites for.
   * @param {RequestInit} fetchOpts Optional fetch options to make use of
   *                                while requesting the Capabilities.
   * @return {Promise<any>} An object representing the WMS capabilities.
   */
  static async getWmsCapabilitiesByLayer(
    layer: OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS>,
    fetchOpts: RequestInit = {}
  ): Promise<any> {
    const capabilitiesUrl = this.getCapabilitiesUrl(layer);
    return await this.getWmsCapabilities(capabilitiesUrl, fetchOpts);
  }

  /**
   * Returns the Capabilities URL for the given layer.
   *
   * @param {import("../types").WMSLayer} layer The layer to the get the Capabilities URL for.
   * @return {string} The Capabilities URL.
   */
  static getCapabilitiesUrl(layer: OlLayerTile<OlSourceTileWMS> | OlLayerImage<OlSourceImageWMS>) {
    const layerSource = layer.getSource();
    const layerBaseUrl = LayerUtil.getLayerUrl(layer);
    const wmsVersion = layerSource?.getParams()?.VERSION || '1.3.0';

    return UrlUtil.createValidGetCapabilitiesRequest(
      layerBaseUrl, 'WMS', wmsVersion);
  }

  /**
   * Returns the layers from a parsed WMS GetCapabilities object.
   *
   * @param {Object} capabilities A capabilities object.
   * @param {string} nameField Configure the field which should be set as the
   *                           'name' property in the openlayers layer.
   * @param {(url: string) => string} [proxyFn] Optional proxy function which can be applied to
   *                           `GetMap`, `GetFeatureInfo` and `GetLegendGraphic`
   *                           requests to avoid CORS issues.
   * @return {import("ol/layer/Image").default<any>[]} Array of OlLayerImage
   */
  static getLayersFromWmsCapabilities(
    capabilities: any,
    nameField: string  = 'Name',
    proxyFn?: (proxyUrl: string) => string
  ): OlLayerImage<OlSourceImageWMS>[] {
    const wmsVersion = _get(capabilities, 'version');
    const layersInCapabilities = _get(capabilities, 'Capability.Layer.Layer');
    const wmsGetMapConfig = _get(capabilities, 'Capability.Request.GetMap');
    const wmsGetFeatureInfoConfig = _get(capabilities, 'Capability.Request.GetFeatureInfo');
    const getMapUrl = _get(wmsGetMapConfig, 'DCPType[0].HTTP.Get.OnlineResource');
    const getFeatureInfoUrl = _get(wmsGetFeatureInfoConfig, 'DCPType[0].HTTP.Get.OnlineResource');

    return layersInCapabilities.map((layerObj: any) => {
      const title = _get(layerObj, 'Attribution.Title');
      const onlineResource = _get(layerObj, 'Attribution.OnlineResource');
      const attributions = [onlineResource ? `<a target="_blank" href="${onlineResource}">${title}</a>` : title];
      const legendUrl = _get(layerObj, 'Style[0].LegendURL[0].OnlineResource');

      return new OlLayerImage({
        opacity: 1,
        properties: {
          title: _get(layerObj, 'Title'),
          name: _get(layerObj, nameField),
          abstract: _get(layerObj, 'Abstract'),
          getFeatureInfoUrl: _isFunction(proxyFn) ? proxyFn(getFeatureInfoUrl) : getFeatureInfoUrl,
          getFeatureInfoFormats: _get(wmsGetFeatureInfoConfig, 'Format'),
          legendUrl: _isFunction(proxyFn) ? proxyFn(legendUrl) : legendUrl,
          queryable: _get(layerObj, 'queryable')
        },
        source: new OlSourceImageWMS({
          url: _isFunction(proxyFn) ? proxyFn(getMapUrl) : getMapUrl,
          attributions: attributions,
          params: {
            LAYERS: _get(layerObj, 'Name'),
            VERSION: wmsVersion
          }
        })
      });
    });
  }

}

export default CapabilitiesUtil;
