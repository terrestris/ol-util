/* eslint-env jest*/
import OlLayerGroup from 'ol/layer/Group';
import OlLayerTile from 'ol/layer/Tile';
import OlMap from 'ol/Map';
import OlSourceTile from 'ol/source/Tile';

import TestUtil from '../TestUtil';
import { PermalinkUtil } from './PermalinkUtil';

let map: OlMap;

beforeEach(() => {
  map = TestUtil.createMap();
});

afterEach(() => {
  TestUtil.removeMap(map);
});

describe('PermalinkUtil', () => {

  describe('Basic test', () => {
    it('is defined', () => {
      expect(PermalinkUtil).not.toBeUndefined();
    });
  });

  describe('Static methods', () => {

    describe('#getLink', () => {

      it('is defined', () => {
        expect(PermalinkUtil.getLink).not.toBeUndefined();
      });

      it('creates a valid permalink', () => {
        map.getView().setCenter([50, 7]);
        map.getView().setZoom(7);
        map.addLayer(new OlLayerTile({
          visible: true,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'peter'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'paul'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: true,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'pan'
          }
        }));
        const link = PermalinkUtil.getLink(map);
        const url = new URL(link);
        const center = url.searchParams.get('center');
        const zoom = url.searchParams.get('zoom');
        const layers = url.searchParams.get('layers');

        expect(center).toBe('50;7');
        expect(zoom).toBe('7');
        expect(layers).toBe('peter;pan');
      });

      it('correctly uses optional separator on link creation', () => {
        map.getView().setCenter([50, 7]);
        map.getView().setZoom(7);
        map.addLayer(new OlLayerTile({
          visible: true,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'peter'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: true,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'pan'
          }
        }));

        const link = PermalinkUtil.getLink(map, '|');
        const url = new URL(link);
        const center = url.searchParams.get('center');
        const layers = url.searchParams.get('layers');

        expect(center).toBe('50|7');
        expect(layers).toBe('peter|pan');

      });
    });

    describe('#applyLink', () => {

      it('is defined', () => {
        expect(PermalinkUtil.applyLink).not.toBeUndefined();
      });

      it('applies a given permalink', () => {
        map.getLayers().clear();
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'peter'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'paul'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'pan'
          }
        }));

        const link = 'http://fake?zoom=3&center=10;20&layers=peter;pan';
        Object.defineProperty(global.window, 'location', {
          value: {
            href: link
          }
        });
        PermalinkUtil.applyLink(map);

        expect(map.getView().getCenter()).toEqual([10, 20]);
        expect(map.getView().getZoom()).toBe(3);
        const visibles = map.getLayers().getArray()
          .filter(l => l.getVisible())
          .map(l => l.get('name'));
        expect(visibles).toEqual(['peter', 'pan']);
      });

      it('correctly uses optional separator on link apply', () => {
        map.getLayers().clear();
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'peter'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'paul'
          }
        }));
        map.addLayer(new OlLayerTile({
          visible: false,
          source: new OlSourceTile({
            attributions: ''
          }),
          properties: {
            name: 'pan'
          }
        }));

        const link = 'http://fake?zoom=3&center=10|20&layers=peter|pan';
        Object.defineProperty(window, 'location', {
          value: {
            href: link
          },
          configurable: true
        });
        PermalinkUtil.applyLink(map, '|');

        expect(map.getView().getCenter()).toEqual([10, 20]);
        const visibles = map.getLayers().getArray()
          .filter(l => l.getVisible())
          .map(l => l.get('name'));
        expect(visibles).toEqual(['peter', 'pan']);
      });

      it('applies visible state to parenting groups', () => {
        map.getLayers().clear();
        map.addLayer(new OlLayerGroup({
          visible: false,
          layers: [
            new OlLayerTile({
              visible: false,
              source: new OlSourceTile({
                attributions: ''
              }),
              properties: {
                name: 'paul'
              }
            }),
            new OlLayerTile({
              visible: false,
              source: new OlSourceTile({
                attributions: ''
              }),
              properties: {
                name: 'pan'
              }
            })
          ],
          properties: {
            name: 'peter'
          }
        }));

        const link = 'http://fake?zoom=3&center=10|20&layers=pan';
        Object.defineProperty(window, 'location', {
          value: {
            href: link
          },
          configurable: true
        });
        PermalinkUtil.applyLink(map, '|');

        const firstLevelVisibles = map.getLayers().getArray()
          .filter(l => l.getVisible())
          .map(l => l.get('name'));
        expect(firstLevelVisibles).toEqual(['peter']);

        let firstElement = map.getLayers().getArray()[0];
        expect(firstElement).toBeInstanceOf(OlLayerGroup);
        const secondLevelVisibles = (firstElement as OlLayerGroup)
          .getLayers().getArray().filter(l => l.getVisible())
          .map(l => l.get('name'));
        expect(secondLevelVisibles).toEqual(['pan']);
      });
    });

  });
});
