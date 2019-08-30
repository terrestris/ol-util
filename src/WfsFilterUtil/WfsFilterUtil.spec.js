/*eslint-env jest*/

import {
  WfsFilterUtil,
} from '../index';

describe('WfsFilterUtil', () => {

  const featureType = 'featureType';
  const stringSearchTerm = 'searchMe';
  const digitSearchTerm = '123';
  let searchAttributes = {
    featureType: []
  };
  let attributeDetails = {
    featureType: {}
  };

  const stringAttr1 = {
    matchCase: false,
    type: 'string',
    exactSearch: false
  };

  const stringAttr2 = {
    matchCase: true,
    type: 'string',
    exactSearch: false
  };

  const numberAttr = {
    matchCase: true,
    type: 'int',
    exactSearch: true
  };

  describe('Basics', () => {
    it('is defined', () => {
      expect(WfsFilterUtil).not.toBeUndefined();
    });
  });

  describe('Static methods', () => {

    describe('#createWfsFilter', () => {

      afterEach(() => {
        searchAttributes = {
          'featureType': []
        };
        Object.keys(attributeDetails[featureType]).forEach(prop => {
          delete attributeDetails[featureType][prop];
        });
      });

      it('is defined', () => {
        expect(WfsFilterUtil.createWfsFilter).toBeDefined();
      });

      it ('returns null if no search attributes for the provided feature type are found', () => {
        searchAttributes = {
          'someAnotherFeatureType': []
        };
        attributeDetails['featureType']['stringAttr1'] = stringAttr1;

        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchAttributes, attributeDetails);

        expect(got).toBeNull();
      });

      it ('returns simple LIKE filter if only one attribute is provided and exactSearch flag is false or not given', () => {
        searchAttributes[featureType].push('stringAttr2');
        attributeDetails['featureType']['stringAttr2'] = stringAttr2;

        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchAttributes, attributeDetails);

        expect(got.getTagName()).toBe('PropertyIsLike');
        expect(got.pattern).toEqual(`*${stringSearchTerm}*`);
        expect(got.propertyName).toEqual(searchAttributes[featureType][0]);
        expect(got.matchCase).toEqual(stringAttr2.matchCase);
      });

      it ('returns simple LIKE filter if only one attribute is provided and attributeDetails argument is omitted', () => {
        searchAttributes[featureType].push('stringAttr1');

        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchAttributes);

        expect(got.getTagName()).toBe('PropertyIsLike');
        expect(got.pattern).toEqual(`*${stringSearchTerm}*`);
        expect(got.propertyName).toEqual(searchAttributes[featureType][0]);
        expect(got.matchCase).toBeFalsy();
      });

      it ('returns simple EQUALTO filter if only one attribute is provided and exactSearch flag is true', () => {
        searchAttributes[featureType].push('numberAttr');
        attributeDetails['featureType']['numberAttr'] = numberAttr;

        const got = WfsFilterUtil.createWfsFilter(featureType, digitSearchTerm, searchAttributes, attributeDetails);

        expect(got.getTagName()).toBe('PropertyIsEqualTo');
        expect(got.expression).toEqual(digitSearchTerm);
        expect(got.propertyName).toEqual(searchAttributes[featureType][0]);
      });

      it ('returns combined OR filter if more than one search attributes are provided', () => {
        searchAttributes[featureType].push(...['stringAttr1', 'stringAttr2']);
        attributeDetails = {
          'featureType': {
            'stringAttr1': stringAttr1,
            'stringAttr2': stringAttr2
          }
        };

        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchAttributes, attributeDetails);

        expect(got.getTagName()).toBe('Or');
        expect(got.conditions.length).toEqual(searchAttributes[featureType].length);
      });
    });

    describe('#getCombinedRequests', () => {

      const searchOpts = {
        featureTypes: [
          'someNs:someFeatureType',
          'someAnotherNs:someAnotherFeatureType'
        ],
        'searchAttributes': {
          'someNs:someFeatureType': [
            'name'
          ],
          'someAnotherNs:someAnotherFeatureType': [
            'anotherName'
          ]
        }
      };
      const searchTerm = 'findMe';

      it('is defined', () => {
        expect(WfsFilterUtil.getCombinedRequests).toBeDefined();
      });

      it('creates WFS filter for each feature type', () => {
        const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
        WfsFilterUtil.getCombinedRequests(searchOpts, searchTerm);
        expect(filterSpy).toHaveBeenCalledTimes(searchOpts.featureTypes.length);
        filterSpy.mockRestore();
      });

      it('creates WFS GetFeature request body containing queries and filter for each feature type', () => {
        const got = WfsFilterUtil.getCombinedRequests(searchOpts, searchTerm);
        expect(got.tagName).toBe('GetFeature');
        expect(got.querySelectorAll('Query').length).toBe(searchOpts.featureTypes.length);
        got.querySelectorAll('Query').forEach(query => {
          expect(query.children[0].tagName).toBe('Filter');
          expect(query.children[0].getElementsByTagName('Literal')[0].innerHTML).toBe(`*${searchTerm}*`);
        });
      });
    });
  });
});
