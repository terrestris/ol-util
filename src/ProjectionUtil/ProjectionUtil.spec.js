/*eslint-env jest*/
import proj4 from 'proj4';
import OlProjection from 'ol/proj';

import {
  defaultProj4CrsDefinitions,
  defaultProj4CrsMappings,
  ProjectionUtil
} from './ProjectionUtil.js';

describe('ProjectionUtil', () => {

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
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const olSpy = jest.spyOn(OlProjection, 'setProj4');

        const length = Object.keys(defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions();
        expect(proj4Spy).toHaveBeenCalledTimes(length);
        expect(olSpy).toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
        olSpy.mockReset();
        olSpy.mockRestore();
      });
    });

    describe('#initProj4DefinitionMappings', () => {
      it('is defined', () => {
        expect(ProjectionUtil.initProj4DefinitionMappings).not.toBeUndefined();
      });
      it('it registers the given CRS mappings in proj4', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(defaultProj4CrsMappings).length;

        ProjectionUtil.initProj4DefinitionMappings(defaultProj4CrsMappings);
        expect(proj4Spy).toHaveBeenCalledTimes(length * 2);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });
    });
  });
});
