/*eslint-env jest*/

import AnimateUtil from '../AnimateUtil/AnimateUtil';

describe('AnimateUtil', () => {

  describe('Basics', () => {
    it('is defined', () => {
      expect(AnimateUtil).toBeDefined();
    });
  });

  describe('Static methods', () => {
    describe('#moveFeature', () => {
      it('is defined', () => {
        expect(AnimateUtil.moveFeature).toBeDefined();
      });
    });
  });
});
