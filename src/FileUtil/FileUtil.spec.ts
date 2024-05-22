/* eslint-env jest*/

import shpwrite, { OutputType } from '@mapbox/shp-write';
import OlMap from 'ol/Map';

import {
  FileUtil
} from '../index';
import TestUtil from '../TestUtil';
import geoJson from './federal-states-ger.json';

const geoJson2: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [47, -11]
    },
    properties: {
      song: 'If you have ghosts'
    }
  }]
};

describe('FileUtil', () => {
  const geoJsonFile = new File([JSON.stringify(geoJson)], 'geo.json', {
    type: 'application/json',
    lastModified: new Date().getMilliseconds()
  });

  let map: OlMap;

  it('is defined', () => {
    expect(FileUtil).not.toBeUndefined();
  });

  describe('Static methods', () => {
    beforeEach(() => {
      map = TestUtil.createMap();
    });

    afterEach(() => {
      TestUtil.removeMap(map);
    });

    describe('#addGeojsonLayer', () => {
      it('adds a layer from a geojson string', () => {
        expect.assertions(2);
        return new Promise((resolve) => {
          const layers = map.getLayers();
          layers.on('add', (event) => {
            const layer = event.element;
            expect(layers.getLength()).toBe(2);
            expect(layer.getSource().getFeatures().length).toBe(16);
            resolve(true);
          });
          FileUtil.addGeojsonLayer(JSON.stringify(geoJson), map);
        });
      });
    });

    describe('#addGeojsonLayerFromFile', () => {
      it('reads the geojson file and adds a layer to the map', () => {
        expect.assertions(2);
        return new Promise((resolve) => {
          const layers = map.getLayers();
          layers.on('add', (event) => {
            const layer = event.element;
            expect(layers.getLength()).toBe(2);
            expect(layer.getSource().getFeatures().length).toBe(16);
            resolve(true);
          });
          FileUtil.addGeojsonLayerFromFile(geoJsonFile, map);
        });
      });
    });

    describe('#addShpLayerFromFile', () => {
      it('reads the shp file and adds a layer to the map', async () => {
        const shpBuffer = await shpwrite.zip<'arraybuffer'>(geoJson2, {
          outputType: 'arraybuffer',
          compression: 'STORE'
        });

        const shpFile = new File([new Blob([shpBuffer])], 'geo.zip', {
          type: 'application/zip',
          lastModified: new Date().getMilliseconds()
        });

        expect.assertions(6);

        return new Promise((resolve) => {
          const layers = map.getLayers();
          layers.on('add', (event) => {
            const layer = event.element;
            expect(layers.getLength()).toBe(2);

            var features = layer.getSource().getFeatures();
            expect(features.length).toBe(1);
            var feat = features[0];
            var coords = feat.getGeometry().getCoordinates();
            var properties = feat.getProperties();

            expect(coords[0]).toBe(47);
            expect(coords[1]).toBe(-11);
            expect('song' in properties).toBe(true);
            expect(properties.song).toBe('If you have ghosts');
            resolve(true);
          });
          FileUtil.addShpLayerFromFile(shpFile, map);
        });
      });
    });

  });
});
