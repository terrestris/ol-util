import Logger from '@terrestris/base-util/dist/Logger';
import StringUtil from '@terrestris/base-util/dist/StringUtil/StringUtil';
import OpenLayersParser from 'geostyler-openlayers-parser';
import { isNil } from 'lodash';
import _uniq from 'lodash/uniq';
import { Extent as OlExtent } from 'ol/extent';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayer from 'ol/layer/Layer';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceOSM from 'ol/source/OSM';
import OlSourceStadiaMaps from 'ol/source/StadiaMaps';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceVector from 'ol/source/Vector';
import OlSourceWMTS from 'ol/source/WMTS';

import CapabilitiesUtil from '../CapabilitiesUtil/CapabilitiesUtil';
import { WmsLayer, WmtsLayer } from '../typeUtils/typeUtils';
import { InkmapGeoJsonLayer, InkmapLayer } from './InkmapTypes';

/**
 * Helper class for layer interaction.
 *
 * @class LayerUtil
 */
class LayerUtil {

  /**
   * Returns the configured URL of the given layer.
   *
   * @param { WmsLayer | WmtsLayer } layer The layer
   *   to get the URL from.
   * @returns {string} The layer URL.
   */
  static getLayerUrl = (
    layer: WmsLayer | WmtsLayer
  ): string => {
    const layerSource = layer.getSource();

    if (!layerSource) {
      return '';
    } else if (layerSource instanceof OlSourceTileWMS) {
      return layerSource.getUrls()?.[0] ?? '';
    } else if (layerSource instanceof OlSourceImageWMS) {
      return layerSource.getUrl() ?? '';
    } else {
      return layerSource.getUrls()?.[0] ?? '';
    }
  };

  /**
   * Returns the extent of the given layer as defined in the
   * appropriate Capabilities document.
   *
   * @param {WmsLayer} layer
   * @param {RequestInit} fetchOpts Optional fetch options to make use of
   *                                while requesting the Capabilities.
   * @returns {Promise<[number, number, number, number]>} The extent of the layer.
   */
  static async getExtentForLayer(
    layer: WmsLayer,
    fetchOpts: RequestInit = {}
  ): Promise<OlExtent> {
    const capabilities = await CapabilitiesUtil.getWmsCapabilitiesByLayer(layer, fetchOpts);

    let layerNodes = capabilities?.Capability?.Layer?.Layer;

    if (!layerNodes) {
      throw new Error('Unexpected format of the Capabilities.');
    }

    if (!Array.isArray(layerNodes)) {
      layerNodes = [layerNodes];
    }

    const layerName = layer.getSource()?.getParams().LAYERS;
    const version = layer.getSource()?.getParams().VERSION || '1.3.0';
    const layers = layerNodes.filter((l: any) => {
      return l.Name === layerName;
    });

    if (!layers || layers.length === 0) {
      throw new Error('Could not find the desired layer in the Capabilities.');
    }

    let extent;

    if (version === '1.3.0') {
      const {
        eastBoundLongitude,
        northBoundLatitude,
        southBoundLatitude,
        westBoundLongitude
      } = layers[0].EX_GeographicBoundingBox;
      extent = [
        westBoundLongitude,
        southBoundLatitude,
        eastBoundLongitude,
        northBoundLatitude,
      ];
    } else if (version === '1.1.0' || version === '1.1.1') {
      const {
        minx,
        miny,
        maxx,
        maxy
      } = layers[0].LatLonBoundingBox;
      extent = [minx, miny, maxx, maxy];
    }

    if (!extent || extent?.length !== 4) {
      throw new Error('No extent set in the Capabilities.');
    }

    return extent;
  }

  /**
   * Converts a given OpenLayers layer to an inkmap layer spec.
   *
   */
  static async mapOlLayerToInkmap(
    olLayer: OlLayer
  ): Promise<InkmapLayer> {
    const source = olLayer.getSource();
    if (!olLayer.getVisible()) {
      // do not include invisible layers
      return Promise.reject();
    }
    const opacity = olLayer.getOpacity();
    const legendUrl = olLayer.get('legendUrl');
    const layerName = olLayer.get('name');
    let time;
    if (source instanceof OlSourceTileWMS || source instanceof OlSourceImageWMS) {
      time = source.getParams().TIME;
    }

    // todo: introduce config object which hold possible additional configurations
    const attributionString = LayerUtil.getLayerAttributionsText(olLayer, ' ,', true);

    if (source instanceof OlSourceTileWMS) {
      return {
        type: 'WMS',
        url: source.getUrls()?.[0] ?? '',
        opacity,
        attribution: attributionString,
        layer: source.getParams()?.LAYERS,
        tiled: true,
        legendUrl,
        layerName,
        customParams: {
          ...(time && { time })
        }
      };
    } else if (source instanceof OlSourceImageWMS) {
      return {
        type: 'WMS',
        url: source.getUrl() ?? '',
        opacity,
        attribution: attributionString,
        layer: source.getParams()?.LAYERS,
        tiled: false,
        legendUrl,
        layerName,
        customParams: {
          ...(time && { time })
        }
      };
    } else if (source instanceof OlSourceWMTS) {
      const olTileGrid = source.getTileGrid();
      const resolutions = olTileGrid?.getResolutions();
      const matrixIds = resolutions?.map((res: number, idx: number) => idx);

      const tileGrid = {
        resolutions: olTileGrid?.getResolutions(),
        extent: olTileGrid?.getExtent(),
        matrixIds: matrixIds
      };

      return {
        type: 'WMTS',
        requestEncoding: source.getRequestEncoding(),
        url: source.getUrls()?.[0] ?? '',
        layer: source.getLayer(),
        projection: source.getProjection()?.getCode(),
        matrixSet: source.getMatrixSet(),
        tileGrid,
        format: source.getFormat(),
        opacity,
        attribution: attributionString,
        legendUrl,
        layerName
      };
    } else if (source instanceof OlSourceOSM) {
      return {
        type: 'XYZ',
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        opacity,
        attribution: '© OpenStreetMap (www.openstreetmap.org)',
        tiled: true,
        legendUrl,
        layerName
      };
    } else if (source instanceof OlSourceStadiaMaps) {
      const urls = source.getUrls();
      if (isNil(urls)) {
        return Promise.reject();
      }
      return {
        type: 'XYZ',
        url: urls[0],
        opacity,
        attribution: attributionString,
        tiled: true,
        legendUrl,
        layerName
      };
    } else if (source instanceof OlSourceVector) {
      const geojson = new OlFormatGeoJSON().writeFeaturesObject(source.getFeatures());
      const parser = new OpenLayersParser();
      const geojsonLayerConfig: InkmapGeoJsonLayer = {
        type: 'GeoJSON',
        geojson,
        attribution: attributionString,
        style: undefined,
        legendUrl,
        layerName
      };

      let olStyle = null;
      // @ts-ignore
      if (olLayer.getStyle) {
        // @ts-ignore
        olStyle = olLayer.getStyle();
      }

      // todo: support style function / different styles per feature
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
          geojsonLayerConfig.style = gsStyle.output;
        }
      }
      return geojsonLayerConfig;
    }
    return Promise.reject();
  }

  /**
   * Returns all attributions as text joined by a separator.
   *
   * @param {OlLayer} layer The layer to get the attributions from.
   * @param {string} separator The separator separating multiple attributions.
   * @param {boolean} removeDuplicates Whether to remove duplicated attribution
   * strings or not.
   * @returns {string} The attributions.
   */
  static getLayerAttributionsText = (
    layer: OlLayer,
    separator: string = ', ',
    removeDuplicates: boolean = false
  ): string => {
    if (isNil(layer)) {
      return '';
    }
    const attributionsFn = layer.getSource()?.getAttributions();
    // @ts-ignore
    let attributions = attributionsFn ? attributionsFn(undefined) : null;

    let attributionString;
    if (Array.isArray(attributions)) {
      if (removeDuplicates) {
        attributions = _uniq(attributions);
      }
      attributionString = attributions.map(StringUtil.stripHTMLTags).join(separator);
    } else {
      attributionString = attributions ? StringUtil.stripHTMLTags(attributions) : '';
    }
    return attributionString;
  };
}

export default LayerUtil;
