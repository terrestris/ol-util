export interface InkmapWmsLayer {
  type: 'WMS';
  url: string;
  opacity?: number;
  attribution?: string;
  layer: string;
  tiled?: boolean;
  legendUrl?: string;
  layerName?: string;
  customParams?: any;
}

export interface InkmapWmtsLayer {
  type: 'WMTS';
  url: string;
  opacity?: number;
  attribution?: string;
  layer?: string;
  projection?: string;
  matrixSet?: string;
  tileGrid?: any;
  format?: string;
  requestEncoding?: string;
  legendUrl?: string;
  layerName?: string;
}

export interface InkmapGeoJsonLayer {
  type: 'GeoJSON';
  attribution?: string;
  style: any;
  geojson: any;
  legendUrl?: string;
  layerName?: string;
}

export interface InkmapWfsLayer {
  type: 'WFS';
  url: string;
  attribution?: string;
  layer?: string;
  projection?: string;
  legendUrl?: string;
  layerName?: string;
}

export interface InkmapOsmLayer {
  type: 'XYZ';
  url: string;
  opacity?: number;
  attribution?: string;
  layer?: string;
  tiled?: boolean;
  projection?: string;
  matrixSet?: string;
  tileGrid?: any;
  style?: any;
  format?: string;
  requestEncoding?: string;
  geojson?: any;
  legendUrl?: string;
  layerName?: string;
}

export type InkmapLayer = InkmapWmsLayer | InkmapWmtsLayer | InkmapGeoJsonLayer | InkmapWfsLayer | InkmapOsmLayer;

export interface ScaleBarSpec {
  position: 'bottom-left' | 'bottom-right';
  units: string;
}

export interface InkmapProjectionDefinition {
  name: string;
  bbox: [number, number, number, number];
  proj4: string;
}

export interface InkmapPrintSpec {
  layers: InkmapLayer[];
  size: [number, number] | [number, number, string];
  center: [number, number];
  dpi: number;
  scale: number;
  scaleBar: boolean | ScaleBarSpec;
  northArrow: boolean | string;
  projection: string;
  projectionDefinitions?: InkmapProjectionDefinition[];
  attributions: boolean | 'top-left' | 'bottom-left' | 'bottom-right' | 'top-right';
}
