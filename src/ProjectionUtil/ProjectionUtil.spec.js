/*eslint-env jest*/
import proj4 from 'proj4';
import * as OlProj4 from 'ol/proj/proj4';

import ProjectionUtil from './ProjectionUtil.js';

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
        OlProj4.register = jest.fn();
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(ProjectionUtil.defaultProj4CrsDefinitions).length;

        ProjectionUtil.initProj4Definitions();
        expect(proj4Spy).toHaveBeenCalledTimes(length);
        expect(OlProj4.register).toHaveBeenCalled();

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });
    });

    describe('#initProj4DefinitionMappings', () => {
      it('is defined', () => {
        expect(ProjectionUtil.initProj4DefinitionMappings).not.toBeUndefined();
      });
      it('it registers the given CRS mappings in proj4', () => {
        const proj4Spy = jest.spyOn(proj4, 'defs');
        const length = Object.keys(ProjectionUtil.defaultProj4CrsMappings).length;

        ProjectionUtil.initProj4DefinitionMappings(ProjectionUtil.defaultProj4CrsMappings);
        expect(proj4Spy).toHaveBeenCalledTimes(length * 2);

        proj4Spy.mockReset();
        proj4Spy.mockRestore();
      });
    });
  });
});
