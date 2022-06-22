/**
 * @typedef {import("ol/layer/Layer").default<import("ol/source/TileWMS").default|import("ol/source/ImageWMS").default>} WMSLayer
 */

/**
 * @typedef {import("ol/layer/Layer").default<import("ol/source/TileWMS").default|import("ol/source/ImageWMS").default
 *  |import("ol/source/WMTS")>} WMSOrWMTSLayer
 */

/**
 * @typedef {{
 *   layers: InkmapLayer[],
 *   size?: number[],
 *   center: [number, number],
 *   dpi: number,
 *   scale: number,
 *   scalebar: boolean | ScaleBarSpec,
 *   northArrow: boolean | string,
 *   projection: string,
 *   projectionDefinitions?: InkmapProjectionDefinition[],
 *   attributions: boolean | 'top-left' | 'bottom-left' | 'bottom-right' | 'top-right'
 *  }} InkmapPrintSpec
 */

/**
 * @typedef {InkmapWmsLayer | InkmapWmtsLayer | InkmapGeoJsonLayer | InkmapWfsLayer | InkmapOsmLayer} InkmapLayer
 */

/**
 * @typedef {{
 *   position: 'bottom-left' | 'bottom-right',
 *   units: string
 *  }} ScaleBarSpec
 */

/**
 * @typedef {{
 *   type: 'WMS',
 *   url: string,
 *   opacity?: number,
 *   attribution?: string,
 *   layer: string,
 *   tiled?: boolean
 *  }} InkmapWmsLayer
 */

/**
 * @typedef {{
 *   type: 'WMTS',
 *   url: string,
 *   opacity?: number,
 *   attribution?: string,
 *   layer?: string,
 *   projection?: string,
 *   matrixSet?: string,
 *   tileGrid?: any,
 *   format?: string,
 *   requestEncoding?: string
 *  }} InkmapWmtsLayer
 */

/**
 * @typedef {{
 *   type: 'GeoJSON',
 *   attribution?: string,
 *   style: any,
 *   geojson: any
 *  }} InkmapGeoJsonLayer
 */

/**
 * @typedef {{
 *   type: 'WFS',
 *   url: string,
 *   attribution?: string,
 *   layer?: string,
 *   projection?: string
 *  }} InkmapWfsLayer
 */

/**
 * @typedef {{
 *   layers: string,
 *   type: 'XYZ';
 *   url: string,
 *   opacity?: number,
 *   attribution?: string,
 *   layer?: string,
 *   tiled?: boolean,
 *   projection?: string,
 *   matrixSet?: string,
 *   tileGrid?: any,
 *   style?: any,
 *   format?: string,
 *   requestEncoding?: string,
 *   geojson?: any
 *  }} InkmapOsmLayer
 */

/**
 * @typedef {{
 *   name: string,
 *   bbox: [number, number, number, number],
 *   proj4: string
 *  }} InkmapProjectionDefinition
 */

export default undefined;
