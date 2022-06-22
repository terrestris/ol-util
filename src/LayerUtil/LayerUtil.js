import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceOSM from 'ol/source/OSM';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceVector from 'ol/source/Vector';
import OlSourceWMTS from 'ol/source/WMTS';
import OpenLayersParser from 'geostyler-openlayers-parser';

import Logger from '@terrestris/base-util/dist/Logger';
import StringUtil from '@terrestris/base-util/dist/StringUtil/StringUtil';

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
   * Converts a given OpenLayers layer to a inkmap layer spec.
   *
   * @param {import("ol/layer/Layer").default} olLayer The layer.
   *
   * @return {Promise<import("../types").InkmapLayer | null>} Promise of the inmkap layer spec.
   */
  static async mapOlLayerToInkmap(olLayer) {
    const source = olLayer.getSource();
    const opacity = olLayer.getOpacity();

    const attributionString = LayerUtil.getLayerAttributionsText(olLayer);

    if (source instanceof OlSourceTileWMS) {
      const tileWmsLayer = {
        type: 'WMS',
        url: source.getUrls()?.[0] ?? '',
        opacity: opacity,
        attribution: attributionString,
        layer: source.getParams()?.LAYERS,
        tiled: true
      };
      return /** @type {import("../types").InkmapWmsLayer} */ (tileWmsLayer);
    } else if (source instanceof OlSourceImageWMS) {
      const imageWmsLayer = {
        type: 'WMS',
        url: source.getUrl() ?? '',
        opacity: opacity,
        attribution: attributionString,
        layer: source.getParams()?.LAYERS,
        tiled: false
      };
      return /** @type {import("../types").InkmapWmsLayer} */ (imageWmsLayer);
    } else if (source instanceof OlSourceWMTS) {
      const olTileGrid = source.getTileGrid();
      const resolutions = olTileGrid?.getResolutions();
      const matrixIds = resolutions?.map((res, idx) => idx);

      const tileGrid = {
        resolutions: olTileGrid?.getResolutions(),
        extent: olTileGrid?.getExtent(),
        matrixIds: matrixIds
      };

      const wmtsLayer = {
        type: 'WMTS',
        requestEncoding: source.getRequestEncoding(),
        url: source.getUrls()?.[0] ?? '',
        layer: source.getLayer(),
        projection: source.getProjection().getCode(),
        matrixSet: source.getMatrixSet(),
        tileGrid: tileGrid,
        format: source.getFormat(),
        opacity: opacity,
        attribution: attributionString
      };
      return /** @type {import("../types").InkmapWmtsLayer} */ (wmtsLayer);
    } else if (source instanceof OlSourceOSM) {
      const osmLayer = {
        type: 'XYZ',
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        opacity: opacity,
        attribution: '© OpenStreetMap (www.openstreetmap.org)',
        tiled: true
      };
      return /** @type {import("../types").InkmapOsmLayer} */ (osmLayer);
    } else if (source instanceof OlSourceVector) {
      const geojson = new OlFormatGeoJSON().writeFeaturesObject(source.getFeatures());
      const parser = new OpenLayersParser();
      const geojsonLayerConfig = {
        type: 'GeoJSON',
        geojson: geojson,
        attribution: attributionString,
        style: undefined
      };

      let olStyle = null;

      if (olLayer instanceof OlLayerVector) {
        olStyle = olLayer.getStyle();
      }

      // todo: support stylefunction / different styles per feature
      // const styles = source.getFeatures()?.map(f => f.getStyle());

      if (olStyle) {
        const gsStyle = await parser.readStyle(olStyle);
        if (gsStyle.errors) {
          Logger.error('Geostyler errors: ', gsStyle.errors);
        }
        if (gsStyle.warnings) {
          Logger.warn('Geostyler warnings: ', gsStyle.warnings);
        }
        if (gsStyle.unsupportedProperties) {
          Logger.warn('Detected unsupported style properties: ', gsStyle.unsupportedProperties);
        }
        if (gsStyle.output) {
          // @ts-ignore
          geojsonLayerConfig.style = gsStyle.output;
        }
      }
      return /** @type {import("../types").InkmapGeoJsonLayer} */ (geojsonLayerConfig);
    }
    return null;
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
      attributionString = attributions.map(StringUtil.stripHTMLTags).join(separator);
    } else {
      attributionString = attributions ? StringUtil.stripHTMLTags(attributions) : '';
    }
    return attributionString;
  };

}

export default LayerUtil;
