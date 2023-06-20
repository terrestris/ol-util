/* eslint-env jest*/

import OlLayerImage from 'ol/layer/Image';
import OlLayerTile from 'ol/layer/Tile';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlSourceWMTS from 'ol/source/WMTS';
import OlWMTSTileGrid from 'ol/tilegrid/WMTS';

import CapabilitiesUtil from '../CapabilitiesUtil/CapabilitiesUtil';
import { InkmapWmsLayer, InkmapWmtsLayer } from './InkmapTypes';
import LayerUtil from './LayerUtil';

describe('LayerUtil', () => {
  it('is defined', () => {
    expect(LayerUtil).not.toBeUndefined();
  });

  describe('Static methods', () => {
    describe('#getLayerUrl', () => {
      it('returns the url of a supported layer/source type', () => {
        const layer1 = new OlLayerTile({
          source: new OlSourceTileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service?',
            params: {
              LAYERS: 'OSM-WMS'
            }
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const url1 = LayerUtil.getLayerUrl(layer1);

        expect(url1).toEqual('https://ows.terrestris.de/osm-gray/service?');

        const layer2 = new OlLayerImage({
          source: new OlSourceImageWMS({
            url: 'https://ows.terrestris.de/osm-gray/service',
            params: {
              LAYERS: 'OSM-WMS'
            }
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const url2 = LayerUtil.getLayerUrl(layer2);

        expect(url2).toEqual('https://ows.terrestris.de/osm-gray/service');

        const layer3 = new OlLayerTile({
          source: new OlSourceWMTS({
            urls: ['https://ows.terrestris.de/osm-gray/service'],
            layer: 'test',
            matrixSet: 'test',
            tileGrid: new OlWMTSTileGrid({
              matrixIds: [],
              resolutions: [],
              origin: [19, 9]
            }),
            style: 'default'
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const url3 = LayerUtil.getLayerUrl(layer3);

        expect(url3).toEqual('https://ows.terrestris.de/osm-gray/service');
      });
    });

    describe('#getExtentForLayer', () => {
      it('returns the extent of the given layer for GetCapabilities request version 1.3.0', async () => {
        const layer = new OlLayerTile({
          source: new OlSourceTileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service?',
            params: {
              LAYERS: 'OSM-WMS'
            }
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const mockImpl = jest.fn();
        mockImpl.mockReturnValue({
          Capability: {
            Layer: {
              Layer: [{
                Name: 'OSM-WMS',
                // eslint-disable-next-line camelcase
                EX_GeographicBoundingBox: {
                  westBoundLongitude: 1,
                  southBoundLatitude: 2,
                  eastBoundLongitude: 3,
                  northBoundLatitude: 4
                }
              }]
            }
          }
        });
        const getWmsCapabilitiesByLayerSpy = jest.spyOn(CapabilitiesUtil,
          'getWmsCapabilitiesByLayer').mockImplementation(mockImpl);

        const extent = await LayerUtil.getExtentForLayer(layer);

        expect(extent).toEqual([1, 2, 3, 4]);

        getWmsCapabilitiesByLayerSpy.mockRestore();
      });

      it('returns the extent of the given layer for GetCapabilities request version 1.1.1', async () => {
        const layer = new OlLayerTile({
          source: new OlSourceTileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service?',
            params: {
              LAYERS: 'OSM-WMS',
              VERSION: '1.1.1'
            }
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const mockImpl = jest.fn();
        mockImpl.mockReturnValue({
          Capability: {
            Layer: {
              Layer: [{
                Name: 'OSM-WMS',
                // eslint-disable-next-line camelcase
                LatLonBoundingBox: {
                  minx: 1,
                  miny: 2,
                  maxx: 3,
                  maxy: 4
                }
              }]
            }
          }
        });
        const getWmsCapabilitiesByLayerSpy = jest.spyOn(CapabilitiesUtil,
          'getWmsCapabilitiesByLayer').mockImplementation(mockImpl);

        const extent = await LayerUtil.getExtentForLayer(layer);

        expect(extent).toEqual([1, 2, 3, 4]);

        getWmsCapabilitiesByLayerSpy.mockRestore();
      });
    });

    describe('#mapOlLayerToInkmap', () => {
      it('exports WMS tile layer correctly', async () => {
        const layer = new OlLayerTile({
          source: new OlSourceTileWMS({
            url: 'https://ows.terrestris.de/osm-gray/service?',
            params: {
              LAYERS: 'OSM-WMS'
            }
          }),
          properties: {
            name: 'OSM-WMS layer'
          }
        });

        const result = await LayerUtil.mapOlLayerToInkmap(layer) as InkmapWmsLayer;
        expect(result).toBeDefined();
        expect(result.url).toEqual(layer?.getSource()?.getUrls()!.at(0));
        expect(result.layerName).toEqual(layer?.getProperties()?.name);
        expect(result.type).toEqual('WMS');
        expect(result.layer).toEqual(layer?.getSource()?.getParams().LAYERS);
      });

      it('exports WMTS layers correctly', async () => {
        const layer3 = new OlLayerTile({
          source: new OlSourceWMTS({
            urls: ['https://ows.terrestris.de/osm-gray/service'],
            layer: 'test',
            matrixSet: 'test',
            tileGrid: new OlWMTSTileGrid({
              matrixIds: [],
              resolutions: [],
              origin: [19, 9]
            }),
            style: 'default'
          }),
          properties: {
            name: 'OSM-WMS'
          }
        });

        const result = await LayerUtil.mapOlLayerToInkmap(layer3) as InkmapWmtsLayer;
        expect(result).toBeDefined();
        expect(result.url).toEqual(layer3?.getSource()?.getUrls()!.at(0));
        expect(result.layerName).toEqual(layer3?.getProperties()?.name);
        expect(result.type).toEqual('WMTS');
        expect(result.layer).toEqual(layer3?.getSource()?.getLayer());
      });
    });

  });
});
