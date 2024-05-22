import { FeatureLike as OlFeatureLike } from 'ol/Feature';
import OlBaseLayer from 'ol/layer/Base';
import OlImageLayer from 'ol/layer/Image';
import OlLayer from 'ol/layer/Layer';
import OlLayerTile from 'ol/layer/Tile';
import OlTileLayer from 'ol/layer/Tile';
import OlVectorLayer from 'ol/layer/Vector';
import OlImageWMS from 'ol/source/ImageWMS';
import OlTileWMS from 'ol/source/TileWMS';
import OlSourceVector from 'ol/source/Vector';
import OlSourceWMTS from 'ol/source/WMTS';

export type WmsLayer = OlImageLayer<OlImageWMS> | OlTileLayer<OlTileWMS> | OlLayer<OlImageWMS | OlTileWMS>;

export type WmtsLayer = OlLayerTile<OlSourceWMTS>;

export type WfsLayer = OlVectorLayer<OlFeatureLike>;

export function isWmsLayer(layer: OlBaseLayer): layer is WmsLayer {
  if (layer instanceof OlLayer) {
    const source = layer.getSource();
    return source instanceof OlImageWMS || source instanceof OlTileWMS;
  }
  return false;
}

export function isWmtsLayer(layer: OlBaseLayer): layer is WmtsLayer {
  if (layer instanceof OlLayer) {
    const source = layer.getSource();
    return source instanceof OlSourceWMTS;
  }
  return false;
}


export function isWfsLayer(layer: OlLayer): layer is WfsLayer {
  return (layer instanceof OlVectorLayer && layer.getSource() instanceof OlSourceVector);
}
