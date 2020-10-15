/*eslint-env jest*/
import proj4 from 'proj4';
import * as OlProj4 from 'ol/proj/proj4';

import {
  defaultProj4CrsDefinitions,
  defaultProj4CrsMappings,
  ProjectionUtil
} from './ProjectionUtil.js';

let registerSpy;
let defsSpy;
beforeEach(() => {
  registerSpy = jest.spyOn(OlProj4, 'register').mockImplementation( jest.fn );
  defsSpy = jest.spyOn(proj4, 'defs');
});
afterEach(() => {
  registerSpy.mockRestore();
  defsSpy.mockRestore();
});

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
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions();
        expect(defsSpy).toHaveBeenCalledTimes(length);
        expect(OlProj4.register).toHaveBeenCalled();
      });

      it('additionally registers a custom projection', () => {
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        // eslint-disable-next-line require-jsdoc
        const hasCustomProj = () => {
          proj4('EPSG:31468');
        };

        expect(hasCustomProj).toThrow();
        ProjectionUtil.initProj4Definitions(custom);
        expect(defsSpy).toHaveBeenCalledTimes(length + 1);
        expect(OlProj4.register).toHaveBeenCalled();
        expect(hasCustomProj).not.toThrow();
      });

      it('does not register a custom projection which is already registered', () => {
        const length = Object.keys(defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions(alreadyThere);
        expect(defsSpy).toHaveBeenCalledTimes(length);
        expect(OlProj4.register).toHaveBeenCalled();
      });

      it('only registers a custom projection, if told so', () => {
        ProjectionUtil.initProj4Definitions(custom, false);
        expect(defsSpy).toHaveBeenCalledTimes(1);
        expect(OlProj4.register).toHaveBeenCalled();
      });

      it('does not fail when neither custom projections nor defaults', () => {
        ProjectionUtil.initProj4Definitions({}, false);
        expect(defsSpy).toHaveBeenCalledTimes(0);
        expect(OlProj4.register).not.toHaveBeenCalled();
      });

    });

    describe('#initProj4DefinitionMappings', () => {

      it('is defined', () => {
        expect(ProjectionUtil.initProj4DefinitionMappings).not.toBeUndefined();
      });

      it('registers the given CRS mappings in proj4', () => {
        const length = Object.keys(defaultProj4CrsMappings).length;

        ProjectionUtil.initProj4DefinitionMappings(defaultProj4CrsMappings);
        expect(defsSpy).toHaveBeenCalledTimes(length * 2);
      });

      it('additionally registers given CRS mappings in proj4', () => {
        const length = Object.keys(defaultProj4CrsMappings).length;

        // first register custom:
        ProjectionUtil.initProj4DefinitionMappings({
          'foo': 'EPSG:31467'
        });
        expect(defsSpy).toHaveBeenCalledTimes((length + 1) * 2);
      });

      it('registers only given CRS mappings in proj4, if told so', () => {
        ProjectionUtil.initProj4DefinitionMappings({
          'foo': 'EPSG:31467'
        }, false);
        expect(defsSpy).toHaveBeenCalledTimes(2);
      });

      it('does not fail when neither custom mappings nor defaults', () => {
        ProjectionUtil.initProj4DefinitionMappings({}, false);
        expect(defsSpy).toHaveBeenCalledTimes(0);
      });

    });

    describe('#toDms', () => {
      it('is defined', () => {
        expect(ProjectionUtil.toDms).not.toBeUndefined();
      });

      it('converts geographic coordinates to degree, minutes, decimal seconds (DMS) format', () => {
        const degreeVal = 19.0909090909;
        const convertedVal = '19° 05\' 27.27\'\'';
        expect(ProjectionUtil.toDms(degreeVal)).toBe(convertedVal);
      });
    });

    describe('#toDmm', () => {
      it('is defined', () => {
        expect(ProjectionUtil.toDmm).not.toBeUndefined();
      });

      it('converts geographic coordinates to degree, decimal minutes (DMM) format', () => {
        const degreeVal = 19.0909090909;
        const convertedVal = '19° 05.4545\'';
        expect(ProjectionUtil.toDmm(degreeVal)).toBe(convertedVal);
      });
    });

    describe('#zerofill', () => {
      it('is defined', () => {
        expect(ProjectionUtil.zerofill).not.toBeUndefined();
      });

      it ('adds leading zero to values less than 10', () => {
        const smallValue = 9.123;
        const bigValue = 15.456;
        const expectedSmallValue = '09.123';
        expect(ProjectionUtil.zerofill(smallValue)).toBe(expectedSmallValue);
        expect(ProjectionUtil.zerofill(bigValue)).toBe(bigValue);
      });
    });

  });

});
