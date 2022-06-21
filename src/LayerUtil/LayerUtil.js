import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceWMTS from 'ol/source/WMTS';

import Logger from '@terrestris/base-util/dist/Logger';

import CapabilitiesUtil from '../CapabilitiesUtil/CapabilitiesUtil';

/**
 * Helper class for layer interaction.
 *
 * @class LayerUtil
 */
class LayerUtil {

  /**
   * Returns the configured URL of the given layer.
   *
   * @param {import("../types").WMSOrWMTSLayer} layer The layer to get the URL from.
   * @returns {string} The layer URL.
   */
  static getLayerUrl = layer => {
    const layerSource = layer.getSource();
    let layerUrl = '';

    if (layerSource instanceof OlSourceTileWMS) {
      layerUrl = layerSource.getUrls()?.[0] ?? '';
    } else if (layerSource instanceof OlSourceImageWMS) {
      layerUrl = layerSource.getUrl() ?? '';
    } else if (layerSource instanceof OlSourceWMTS) {
      layerUrl = layerSource.getUrls()?.[0] ?? '';
    }
    return layerUrl;
  };

  /**
   * Returns the extent of the given layer as defined in the
   * appropriate Capabilities document.
   *
   * @param {import("../types").WMSLayer} layer
   * @returns {Promise<[number, number, number, number]>} The extent of the layer.
   */
  static async getExtentForLayer(layer) {
    const capabilities = await CapabilitiesUtil.getWmsCapabilitiesByLayer(layer);

    if (!capabilities?.Capability?.Layer?.Layer) {
      throw new Error('Unexpected format of the Capabilities.');
    }

    const layerName = layer.getSource()?.getParams().LAYERS;

    /** @type {{ Name: string, EX_GeographicBoundingBox?: number[] }[]} */
    const capabilitiesLayer = capabilities.Capability.Layer.Layer;

    const layers = capabilitiesLayer.filter((l) => {
      return l.Name === layerName;
    });

    if (!layers || layers.length === 0) {
      throw new Error('Could not find the desired layer in the Capabilities.');
    }

    const extent = layers[0].EX_GeographicBoundingBox;

    if (!extent || extent.length !== 4) {
      throw new Error('No extent set in the Capabilities.');
    }

    return /** @type {[number, number, number, number]} */ (extent);
  }

  /**
   * Returns all attributions as text joined by a separator.
   *
   * @param {import("ol/layer/Layer").default} layer The layer to get the attributions from.
   * @param {string} separator The separator separating multiple attributions.
   * @returns {string} The attributions.
   */
  static getLayerAttributionsText = (layer, separator = ', ') => {
    const attributionsFn = layer.getSource()?.getAttributions();
    // @ts-ignore
    const attributions = attributionsFn ? attributionsFn(undefined) : null;

    let attributionString;
    if (Array.isArray(attributions)) {
      attributionString = attributions.map(LayerUtil.getTextFromHtml).join(separator);
    } else {
      attributionString = attributions ? LayerUtil.getTextFromHtml(attributions) : '';
    }
    return attributionString;
  };


  /**
   * Converts a html string into text using DOMParser.
   *
   * Credits: https://stackoverflow.com/questions/822452/strip-html-from-text-javascript/47140708#47140708.
   *
   * @param {string} html The html to convert.
   * @returns {string} The output text. Returns an empty string if parsing fails.
   */
  static getTextFromHtml = (html) => {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || '';
    } catch (error) {
      Logger.error(error);
      return '';
    }
  };

}

export default LayerUtil;
