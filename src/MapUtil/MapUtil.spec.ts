/* eslint-env jest*/

import { getUid } from 'ol';
import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';
import OlInteractionDragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import OlBaseLayer from 'ol/layer/Base';
import OlLayerGroup from 'ol/layer/Group';
import OlLayerImage from 'ol/layer/Image';
import OlLayerTile from 'ol/layer/Tile';
import OlMap from 'ol/Map';
import { Units as OlUnits } from 'ol/proj/Units';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import OlSourceTileWMS from 'ol/source/TileWMS';
import OlView from 'ol/View';

import { MapUtil } from '../index';
import TestUtil from '../TestUtil';

type TestResolutionsType = {
  [key in OlUnits as string]: number;
};

describe('MapUtil', () => {
  const testResolutions: TestResolutionsType = {
    degrees: 0.000004807292355257246,
    m: 0.5345462690925383
  };
  const testScale = 1909.09;

  let map: OlMap;

  beforeEach(() => {
    map = TestUtil.createMap();
  });

  afterEach(() => {
    TestUtil.removeMap(map);
  });

  it('is defined', () => {
    expect(MapUtil).toBeDefined();
  });

  describe('#getInteractionsByName', () => {
    it('is defined', () => {
      expect(MapUtil.getInteractionsByName).toBeDefined();
    });

    it('returns an empty array if no interaction candidate is found', () => {
      let dragInteractionName = 'Drag Queen';
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      dragInteraction.set('name', dragInteractionName);
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByName(
        map, `${dragInteractionName} NOT AVAILABLE`);

      expect(returnedInteractions).toHaveLength(0);
    });

    it('returns the requested interactions by name', () => {
      let dragInteractionName = 'Drag Queen';
      let dragInteraction = new OlInteractionDragRotateAndZoom();
      dragInteraction.set('name', dragInteractionName);
      map.addInteraction(dragInteraction);

      let returnedInteractions = MapUtil.getInteractionsByName(
        map, dragInteractionName);

      expect(returnedInteractions).toHaveLength(1);

      let anotherDragInteraction = new OlInteractionDragRotateAndZoom();
      anotherDragInteraction.set('name', dragInteractionName);
      map.addInteraction(anotherDragInteraction);

      returnedInteractions = MapUtil.getInteractionsByName(
        map, dragInteractionName);

      expect(returnedInteractions).toHaveLength(2);
    });
  });

  describe('#getResolutionForScale', () => {
    it('is defined', () => {
      expect(MapUtil.getResolutionForScale).toBeDefined();
    });

    it('returns expected values for valid units', () => {
      const units: OlUnits[] = ['degrees', 'm'];
      units.forEach( (unit) => {
        expect(MapUtil.getResolutionForScale(testScale, unit)).toBe(testResolutions[unit]);
      });
    });

    it('returns undefined for any units excepting m or degrees', () => {
      const units: OlUnits[] = ['ft', 'radians'];
      units.forEach( (unit) => {
        expect(MapUtil.getResolutionForScale(testScale, unit)).toBeUndefined();
      });
    });

    it('returns inverse of getScaleForResolution', () => {
      const unit = 'm';
      const resolutionToTest = 190919.09;
      const calculateScale = MapUtil.getScaleForResolution(resolutionToTest, unit);
      expect(calculateScale).toBeDefined();
      expect(MapUtil.getResolutionForScale(calculateScale!, unit)).toBe(resolutionToTest);
    });
  });

  describe('#getScaleForResolution', () => {
    it('is defined', () => {
      expect(MapUtil.getScaleForResolution).toBeDefined();
    });

    it('returns expected values for valid units', () => {
      const units: OlUnits[] = ['degrees', 'm'];

      /**
       * Helper method to round number to two floating digits
       */
      const roundToTwoDecimals = (num: number) => (Math.round(num * 100) / 100);

      units.forEach( (unit) => {
        let scale = MapUtil.getScaleForResolution(testResolutions[unit], unit);
        expect(scale).toBeDefined();
        expect(roundToTwoDecimals(scale!)).toBe(testScale);
      });
    });

    it('returns undefined for any units excepting m or degrees', () => {
      const units: OlUnits[] = ['ft', 'radians'];

      units.forEach( (unit) => {
        let scale = MapUtil.getScaleForResolution(testResolutions[unit], unit);
        expect(scale).toBeUndefined();
      });
    });

    it('returns inverse of getResolutionForScale', () => {
      const unit = 'm';
      const calculateScale = MapUtil.getResolutionForScale(testScale, unit);
      expect(calculateScale).toBeDefined();
      expect(MapUtil.getScaleForResolution(calculateScale!, unit)).toBe(testScale);
    });
  });

  describe('#getLayerByOlUid', () => {
    it('returns layer by Uid', () => {
      const firstLayer = map.getLayers().item(0);
      const firstLayerUid = getUid(firstLayer);
      const got = MapUtil.getLayerByOlUid(map, firstLayerUid);
      expect(got).toBe(firstLayer);
    });
    it('returns layer by uid, when map has many layers', () => {
      const firstLayer = map.getLayers().item(0);
      const firstLayerUid = getUid(firstLayer);
      expect(map.getLayers().getLength()).toBe(1);
      let added = 0; // add 10 layers
      while (added < 10) {
        map.addLayer(new OlLayerTile());
        added++;
      }
      const got = MapUtil.getLayerByOlUid(map, firstLayerUid);
      expect(map.getLayers().getLength()).toBe(11);
      expect(got).toBe(firstLayer);
    });
    it('returns undefined for unknown uid', () => {
      const got = MapUtil.getLayerByOlUid(map, 'made-up-uid-123');
      expect(got).toBe(undefined);
    });
  });

  describe('#getLayerByName', () => {
    it('returns the layer by the given name', () => {
      const layerName = 'Peter';
      const layer = new OlLayerTile({
        properties: {
          name: layerName
        }
      });
      map.addLayer(layer);
      const got = MapUtil.getLayerByName(map, layerName);

      expect(got).toBe(layer);
    });

    it('returns undefined if the layer could not be found', () => {
      const layerName = 'OSM-WMS';
      const got = MapUtil.getLayerByName(map, layerName);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayerByNameParam', () => {
    it('returns the layer by the given name', () => {
      const layerName = 'OSM-WMS';
      const layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            LAYERS: layerName,
            TILED: true
          }
        })
      });
      layer.set('key', 'prop');
      map.addLayer(layer);
      const got = MapUtil.getLayerByNameParam(map, layerName);

      expect(got).toBeInstanceOf(OlLayerTile);
      expect(got?.get('key')).toBe('prop');
    });

    it('returns undefined if the layer could not be found', () => {
      const layerName = 'OSM-WMS';
      const got = MapUtil.getLayerByNameParam(map, layerName);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayerByFeature', () => {
    it('returns the layer by the given feature', () => {
      let namespace = 'BVB_NAMESPACE';
      let layerName = 'BVB';
      let qualifiedLayerName = `${namespace}:${layerName}`;

      let featId = `${layerName}.1909`;
      let feat = new OlFeature({
        geometry: new OlGeomPoint([1909, 1909])
      });
      feat.setId(featId);

      let layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            LAYERS: qualifiedLayerName,
            TILED: true
          }
        })
      });
      layer.set('key', 'prop');
      map.addLayer(layer);
      let got = MapUtil.getLayerByFeature(map, feat, [namespace]);

      expect(got).toBeInstanceOf(OlLayerTile);
      expect(got?.get('key')).toBe('prop');
    });

    it('returns undefined if the layer could not be found', () => {
      let namespace = 'BVB_NAMESPACE';
      let layerName = 'BVB';
      let qualifiedLayerName = `${namespace}:${layerName}`;
      let featId = `${layerName}_INVALID.1909`;
      let feat = new OlFeature({
        geometry: new OlGeomPoint([1909, 1909])
      });
      feat.setId(featId);

      let layer = new OlLayerTile({
        visible: false,
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm/service?',
          params: {
            LAYERS: qualifiedLayerName,
            TILED: true
          }
        })
      });
      map.addLayer(layer);
      let got = MapUtil.getLayerByFeature(map, feat, [namespace]);

      expect(got).toBeUndefined();
    });
  });

  describe('#getLayersByGroup', () => {
    it('returns a flattened array of layers out of a given layergroup', () => {
      let layerGroup = new OlLayerGroup({
        layers: [
          TestUtil.createVectorLayer({name: 'Layer 1'}),
          TestUtil.createVectorLayer({name: 'Layer 2'}),
          new OlLayerGroup({
            layers: [
              TestUtil.createVectorLayer({name: 'Sublayer 1'}),
              TestUtil.createVectorLayer({name: 'Sublayer 2'}),
              new OlLayerGroup({
                layers: [
                  TestUtil.createVectorLayer({name: 'Subsublayer 1'}),
                  TestUtil.createVectorLayer({name: 'Subsublayer 2'}),
                ]
              }),
              TestUtil.createVectorLayer({name: 'Sublayer 3'})
            ]
          }),
          TestUtil.createVectorLayer({name: 'Layer 3'})
        ]
      });

      map.setLayerGroup(layerGroup);
      let got = MapUtil.getLayersByGroup(map, layerGroup);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(8);
    });
  });

  describe('#getAllLayers', () => {
    let subLayer: OlBaseLayer;
    let nestedLayerGroup: OlLayerGroup;
    let layer1: OlLayerTile<OlSourceTileWMS>;
    let layer2: OlLayerTile<OlSourceTileWMS>;
    let layerGroup;

    beforeEach(() => {
      const layerSource1 = new OlSourceTileWMS();
      layer1 = new OlLayerTile({
        source: layerSource1,
        properties: {
          name: 'layer1'
        }
      });
      const layerSource2 = new OlSourceTileWMS();
      layer2 = new OlLayerTile({
        visible: false,
        source: layerSource2,
        properties: {
          name: 'layer2'
        }
      });
      subLayer = new OlLayerTile({
        source: new OlSourceTileWMS(),
        properties: {
          name: 'subLayer'
        }
      });
      nestedLayerGroup = new OlLayerGroup({
        layers: [subLayer],
        properties: {
          name: 'nestedLayerGroup'
        }
      });
      layerGroup = new OlLayerGroup({
        layers: [layer1, layer2, nestedLayerGroup]
      });
      map.setLayerGroup(layerGroup);
    });

    it('returns a flat list of all layers (map passed)', () => {
      const got = MapUtil.getAllLayers(map);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(4);
      expect(got).toContain(layer1);
      expect(got).toContain(layer2);
      expect(got).toContain(nestedLayerGroup);
      expect(got).toContain(subLayer);
    });

    it('returns a flat list of all layers (layergroup passed)', () => {
      const got = MapUtil.getAllLayers(nestedLayerGroup);

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(1);
      expect(got).toContain(subLayer);
    });

    it('can be used with a filter', () => {
      const got = MapUtil.getAllLayers(map, l => l.get('name') === 'layer1');

      expect(got).toBeInstanceOf(Array);
      expect(got).toHaveLength(1);
      expect(got).toContain(layer1);
    });

  });

  describe('getLayerPositionInfo', () => {
    let subLayer: OlBaseLayer;
    let nestedLayerGroup: OlLayerGroup;
    let layer1: OlLayerTile<OlSourceTileWMS>;
    let layer2: OlLayerTile<OlSourceTileWMS>;
    let layerGroup: OlLayerGroup;

    beforeEach(() => {
      const layerSource1 = new OlSourceTileWMS();
      layer1 = new OlLayerTile({
        source: layerSource1,
        properties: {
          name: 'layer1'
        }
      });
      const layerSource2 = new OlSourceTileWMS();
      layer2 = new OlLayerTile({
        visible: false,
        source: layerSource2,
        properties: {
          name: 'layer2'
        }
      });
      subLayer = new OlLayerTile({
        source: new OlSourceTileWMS(),
        properties: {
          name: 'subLayer'
        }
      });
      nestedLayerGroup = new OlLayerGroup({
        layers: [subLayer],
        properties: {
          name: 'nestedLayerGroup'
        }
      });
      layerGroup = new OlLayerGroup({
        layers: [layer1, layer2, nestedLayerGroup]
      });
      map.setLayerGroup(layerGroup);
    });

    it('uses the map if second argument is a map', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(layer1, map);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: layerGroup
      });
    });

    it('uses the layerGroup if given as second argument', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(subLayer, nestedLayerGroup);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: nestedLayerGroup
      });
    });

    it('works iterative', () => {
      const layerPositionInfo = MapUtil.getLayerPositionInfo(subLayer, map);

      expect(layerPositionInfo).toEqual({
        position: 0,
        groupLayer: nestedLayerGroup
      });
    });

  });

  describe('GetLegendGraphicUrl', () => {
    let layer1: OlLayerTile<OlSourceTileWMS>;
    let layer2: OlLayerImage<OlSourceImageWMS>;
    let layer3: OlLayerTile<OlSourceTileWMS>;

    beforeEach(() => {
      layer1 = new OlLayerTile({
        source: new OlSourceTileWMS({
          url: 'https://ows.terrestris.de/osm-gray/service?',
          params: {LAYERS: 'OSM-WMS', TILED: true},
          serverType: 'geoserver'
        }),
        properties: {
          name: 'OSM-WMS'
        }
      });
      layer2 = new OlLayerImage({
        source: new OlSourceImageWMS({
          url: 'https://ows.terrestris.de/osm-gray/service',
          params: {LAYERS: 'OSM-WMS', TILED: true},
          serverType: 'geoserver'
        }),
        properties: {
          name: 'OSM-WMS'
        }
      });
      layer3 = new OlLayerTile({
        source: new OlSourceTileWMS({
          urls: [
            'https://a.example.com/service?humpty=dumpty',
            'https://b.example.com/service?foo=bar'
          ],
          params: {LAYERS: 'OSM-WMS', TILED: true},
          serverType: 'geoserver'
        }),
        properties: {
          name: 'OSM-WMS'
        }
      });
    });

    describe('returns a GetLegendGraphicUrl from a given layer', () => {
      it('… for a tiled Layer', () => {
        const legendUrl = MapUtil.getLegendGraphicUrl(layer1);
        const url = 'https://ows.terrestris.de/osm-gray/service?';
        const layerParam = 'LAYER=OSM-WMS';
        const versionParam = 'VERSION=1.3.0';
        const serviceParam = 'SERVICE=WMS';
        const requestParam = 'REQUEST=GetLegendGraphic';
        const formatParam = 'FORMAT=image%2Fpng';

        expect(legendUrl).toContain(url);
        expect(legendUrl).toContain(layerParam);
        expect(legendUrl).toContain(versionParam);
        expect(legendUrl).toContain(serviceParam);
        expect(legendUrl).toContain(requestParam);
        expect(legendUrl).toContain(formatParam);
      });
      it('… for an image Layer', () => {
        const legendUrl = MapUtil.getLegendGraphicUrl(layer2);
        const url = 'https://ows.terrestris.de/osm-gray/service?';
        const layerParam = 'LAYER=OSM-WMS';
        const versionParam = 'VERSION=1.3.0';
        const serviceParam = 'SERVICE=WMS';
        const requestParam = 'REQUEST=GetLegendGraphic';
        const formatParam = 'FORMAT=image%2Fpng';

        expect(legendUrl).toContain(url);
        expect(legendUrl).toContain(layerParam);
        expect(legendUrl).toContain(versionParam);
        expect(legendUrl).toContain(serviceParam);
        expect(legendUrl).toContain(requestParam);
        expect(legendUrl).toContain(formatParam);
      });
    });

    it('does not append multiple questionmarks in URL', () => {
      const legendUrl = MapUtil.getLegendGraphicUrl(layer1);
      const numQuestionMarks = (legendUrl.match(/\?/g) || []).length;
      expect(legendUrl).toEqual(expect.stringContaining('?'));
      expect(legendUrl).toEqual(expect.not.stringContaining('??'));
      expect(numQuestionMarks).toEqual(1);
    });

    it('works as expected when layer URL contains params', () => {
      const legendUrl = MapUtil.getLegendGraphicUrl(layer3);
      const numQuestionMarks = (legendUrl.match(/\?/g) || []).length;
      const containsParams = /humpty=dumpty/.test(legendUrl);
      expect(numQuestionMarks).toEqual(1);
      expect(containsParams).toBe(true);
    });

    it('accepts extraParams for the request', () => {
      const extraParams = {
        HEIGHT: 10,
        WIDTH: 10
      };
      const legendUrl = MapUtil.getLegendGraphicUrl(layer1, extraParams);
      const url = 'https://ows.terrestris.de/osm-gray/service?';
      const layerParam = 'LAYER=OSM-WMS';
      const versionParam = 'VERSION=1.3.0';
      const serviceParam = 'SERVICE=WMS';
      const requestParam = 'REQUEST=GetLegendGraphic';
      const formatParam = 'FORMAT=image%2Fpng';
      const heightParam = 'HEIGHT=10';
      const widthParam = 'WIDTH=10';

      expect(legendUrl).toContain(url);
      expect(legendUrl).toContain(layerParam);
      expect(legendUrl).toContain(versionParam);
      expect(legendUrl).toContain(serviceParam);
      expect(legendUrl).toContain(requestParam);
      expect(legendUrl).toContain(formatParam);
      expect(legendUrl).toContain(heightParam);
      expect(legendUrl).toContain(widthParam);
    });

  });

  describe('layerInResolutionRange', () => {
    it('is defined', () => {
      expect(MapUtil.layerInResolutionRange).not.toBeUndefined();
    });
    it('is a function', () => {
      expect(MapUtil.layerInResolutionRange).toBeInstanceOf(Function);
    });
    it('returns false if not passed a layer', () => {
      expect(MapUtil.layerInResolutionRange()).toBe(false);
    });
    it('returns false if not passed a map', () => {
      const layer = new OlLayerTile();
      expect(MapUtil.layerInResolutionRange(layer)).toBe(false);
    });
    it('returns false if map view does not have a resolution', () => {
      const layer = new OlLayerTile();
      const view = new OlView();
      const olMap: OlMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(false);
    });

    it('returns true: layer (no limits) & any viewRes', () => {
      const layer = new OlLayerTile();
      const view = new OlView({resolution: 42});
      const olMap: OlMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns true: layer (w/ minResolution) & viewRes > l.minres', () => {
      const layer = new OlLayerTile({
        minResolution: 42
      });
      const view = new OlView({resolution: 43});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns true: layer (w/ minResolution) & viewRes = l.minres', () => {
      const layer = new OlLayerTile({
        minResolution: 42
      });
      const view = new OlView({resolution: 42});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns true: layer (w/ maxResolution) & viewRes < l.maxres', () => {
      const layer = new OlLayerTile({
        maxResolution: 42
      });
      const view = new OlView({resolution: 41});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns false: layer (w/ maxResolution) & viewRes = l.maxres', () => {
      const layer = new OlLayerTile({
        maxResolution: 42
      });
      const view = new OlView({resolution: 42});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(false);
    });

    it('returns true: layer (w/ min and max) & viewRes  within', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 46});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns false: layer (w/ min and max) & viewRes outside min', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 38});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(false);
    });

    it('returns true: layer (w/ min and max) & viewRes = min', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 42});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(true);
    });

    it('returns false: layer (w/ min and max) & viewRes outside max', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 54});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(false);
    });

    it('returns false: layer (w/ min and max) & viewRes = max', () => {
      const layer = new OlLayerTile({
        minResolution: 42,
        maxResolution: 50
      });
      const view = new OlView({resolution: 50});
      const olMap = new OlMap({view: view});
      expect(MapUtil.layerInResolutionRange(layer, olMap)).toBe(false);
    });
  });

  describe('#getLayersByProperty', () => {
    it('is defined', () => {
      expect(MapUtil.getLayersByProperty).not.toBeUndefined();
    });

    it('is a function', () => {
      expect(MapUtil.getLayersByProperty).toBeInstanceOf(Function);
    });

    it('returns the layer for the given property', () => {
      const key = 'key';
      const prop = 'prop';
      const layer = new OlLayerTile({
        visible: false
      });
      layer.set(key, prop);
      map.addLayer(layer);

      const got = MapUtil.getLayersByProperty(map, key, prop);

      expect(got).toHaveLength(1);
      expect(got[0]).toEqual(layer);
      expect(got[0]).toBeInstanceOf(OlLayerTile);
      expect(got[0].get('key')).toBe('prop');
    });
  });

  describe('#getZoomForScale', () => {
    it('is defined', () => {
      expect(MapUtil.getZoomForScale).toBeDefined();
    });

    it('returns 0 if negative scale is provided', () => {
      const got = MapUtil.getZoomForScale(-1, [1, 2]);
      expect(got).toBe(0);
    });

    it('calls getResolutionForScale method', () => {
      const spy = jest.spyOn(MapUtil, 'getResolutionForScale');
      MapUtil.getZoomForScale(2000, [1, 2, 3]);

      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });

    it('returns zoom level for provided resolution', () => {
      const mercatorResolutions = [
        1.19432856696, // 4265
        0.597164283478, // 2132
        0.298582141739, // 1066
        0.149291070869 // 533
      ];
      const testScales = [5000, 2500, 1000, 500];
      let index = 0;

      testScales.forEach(scale => {
        expect(MapUtil.getZoomForScale(scale, mercatorResolutions)).toBe(index);
        index++;
      });
    });
  });

  describe('#zoomToFeatures', () => {
    const features = [
      new OlFeature({
        geometry: new OlGeomPoint([0, 0])
      }),
      new OlFeature({
        geometry: new OlGeomPoint([1, 1])
      }),
      new OlFeature({
        geometry: new OlGeomPoint([2, 2])
      })
    ];

    it('is defined', () => {
      expect(MapUtil.zoomToFeatures).toBeDefined();
    });

    it('fits the view extent to the extent of the given features', () => {
      const view = new OlView({
        zoom: 19,
        constrainResolution: true
      });
      const olMap: OlMap = new OlMap({view: view});

      MapUtil.zoomToFeatures(olMap, features);
      const extent = view.calculateExtent();

      expect(extent[0]).toBeCloseTo(-0.866138385868561);
      expect(extent[1]).toBeCloseTo(-0.866138385868561);
      expect(extent[2]).toBeCloseTo(2.866138385868561);
      expect(extent[3]).toBeCloseTo(2.866138385868561);
    });
  });

  describe('#isInScaleRange', () => {
    it('is defined', () => {
      expect(MapUtil.isInScaleRange).toBeDefined();
    });

    it('returns the visibility of a given layer', () => {
      const layer = TestUtil.createVectorLayer();

      let inScaleRange = MapUtil.isInScaleRange(layer, 5);
      expect(inScaleRange).toBe(true);

      layer.setProperties({
        minResolution: 0,
        maxResolution: 10
      });

      inScaleRange = MapUtil.isInScaleRange(layer, 5);
      expect(inScaleRange).toBe(true);

      inScaleRange = MapUtil.isInScaleRange(layer, 15);
      expect(inScaleRange).toBe(false);
    });
  });

  describe('#setVisibilityForLayers', () => {
    it('is defined', () => {
      expect(MapUtil.setVisibilityForLayers).toBeDefined();
    });

    it('sets visibility for named layer correctly ', () => {
      const testName = 'testVisiblityWms';
      const layer = new OlLayerImage({
        source: new OlSourceImageWMS({
          url: 'https://ows.terrestris.de/osm-gray/service',
          params: {LAYERS: 'OSM-WMS', TILED: true},
          serverType: 'geoserver'
        }),
        properties: {
          name: testName
        }
      });

      map.addLayer(layer);

      MapUtil.setVisibilityForLayers(map, [testName], true);
      expect(MapUtil.getLayerByName(map, testName)?.getVisible()).toBe(true);


      MapUtil.setVisibilityForLayers(map, [testName], false);
      expect(MapUtil.getLayerByName(map, testName)?.getVisible()).toBe(false);
    });
  });

  it('sets visibility for layer correctly which is accessed by feature type name', () => {
    const testFeatureType = 'TEST:MY_FEATURE_TYPE_NAME';
    const layer = new OlLayerImage({
      source: new OlSourceImageWMS({
        url: 'https://my-test-wms.de/service',
        params: {LAYERS: testFeatureType}
      }),
      properties: {
        name: 'This layer is just a dummy test layer'
      }
    });

    map.addLayer(layer);

    MapUtil.setVisibilityForLayers(map, [testFeatureType], true);
    expect(MapUtil.getLayerByNameParam(map, testFeatureType)?.getVisible()).toBe(true);


    MapUtil.setVisibilityForLayers(map, [testFeatureType], false);
    expect(MapUtil.getLayerByNameParam(map, testFeatureType)?.getVisible()).toBe(false);
  });

});
