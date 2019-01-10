/*eslint-env jest*/
import proj4 from 'proj4';
import * as OlProj4 from 'ol/proj/proj4';

import {
  defaultProj4CrsDefinitions,
  defaultProj4CrsMappings,
  ProjectionUtil
} from './ProjectionUtil.js';

describe('ProjectionUtil', () => {

  const custom = {
    'EPSG:31468': '+proj=tmerc +lat_0=0 +lon_0=12 ' +
      '+k=1 +x_0=4500000 +y_0=0 +ellps=bessel ' +
      '+towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m ' +
      '+no_defs'
  };

  const alreadyThere = {
    'EPSG:31467': '+proj=tmerc +lat_0=0 +lon_0=9 ' +
      '+k=1 +x_0=3500000 +y_0=0 +ellps=bessel ' +
      '+towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m ' +
      '+no_defs'
  };

  describe('Basic test', () => {
    it('is defined', () => {
      expect(ProjectionUtil).not.toBeUndefined();
    });
  });

  describe('Static methods', () => {

    describe('#initProj4Definitions', () => {

      it('is defined', () => {
        expect(ProjectionUtil.initProj4Definitions).not.toBeUndefined();
      });

      it('it registers the given CRS definitions in proj4 and ol', () => {
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions();
        expect(proj4Spy).toHaveBeenCalledTimes(length);
        expect(OlProj4.register).toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('additionally registers a custom projection', () => {
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        // eslint-disable-next-line require-jsdoc
        const hasCustomProj = () => {
          proj4('EPSG:31468');
        };

        expect(hasCustomProj).toThrow();
        ProjectionUtil.initProj4Definitions(custom);
        expect(proj4Spy).toHaveBeenCalledTimes(length + 1);
        expect(OlProj4.register).toHaveBeenCalled();
        expect(hasCustomProj).not.toThrow();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('does not register a custom projection which is already registered', () => {
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions(alreadyThere);
        expect(proj4Spy).toHaveBeenCalledTimes(length);
        expect(OlProj4.register).toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('only registers a custom projection, if told so', () => {
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');

        ProjectionUtil.initProj4Definitions(custom, false);
        expect(proj4Spy).toHaveBeenCalledTimes(1);
        expect(OlProj4.register).toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('does not fail when neither custom projections nor defaults', () => {
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');

        ProjectionUtil.initProj4Definitions({}, false);
        expect(proj4Spy).toHaveBeenCalledTimes(0);
        expect(OlProj4.register).not.toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

    });

    describe('#initProj4DefinitionMappings', () => {

      it('is defined', () => {
        expect(ProjectionUtil.initProj4DefinitionMappings).not.toBeUndefined();
      });

      it('registers the given CRS mappings in proj4', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsMappings).length;

        ProjectionUtil.initProj4DefinitionMappings(defaultProj4CrsMappings);
        expect(proj4Spy).toHaveBeenCalledTimes(length * 2);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('additionally registers given CRS mappings in proj4', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsMappings).length;

        // first register custom:
        ProjectionUtil.initProj4DefinitionMappings({
          'foo': 'EPSG:31467'
        });
        expect(proj4Spy).toHaveBeenCalledTimes((length + 1) * 2);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('registers only given CRS mappings in proj4, if told so', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');

        ProjectionUtil.initProj4DefinitionMappings({
          'foo': 'EPSG:31467'
        }, false);
        expect(proj4Spy).toHaveBeenCalledTimes(2);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

      it('does not fail when neither custom mappings nor defaults', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');

        ProjectionUtil.initProj4DefinitionMappings({}, false);
        expect(proj4Spy).toHaveBeenCalledTimes(0);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });

    });

  });

});
