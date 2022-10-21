/* eslint-env jest*/
import EqualTo from 'ol/format/filter/EqualTo';
import IsLike from 'ol/format/filter/IsLike';

import WfsFilterUtil, { AttributeDetails, SearchConfig } from './WfsFilterUtil';

describe('WfsFilterUtil', () => {

  const searchConfig: SearchConfig = {
    featureNS: 'test',
    featureTypes: ['featureType'],
    featurePrefix: 'test',
    attributeDetails: [{
      matchCase: false,
      type: 'string',
      exactSearch: false,
      attributeName: 'test'
    }]
  };

  const stringSearchTerm = 'searchMe';
  const digitSearchTerm = '123';

  describe('Basics', () => {
    it('is defined', () => {
      expect(WfsFilterUtil).not.toBeUndefined();
    });
  });

  describe('Static methods', () => {
    describe('#createWfsFilter', () => {

      it('is defined', () => {
        expect(WfsFilterUtil.createWfsFilter).toBeDefined();
      });

      it ('returns null if no search attributes for the provided feature type are found', () => {
        const got = WfsFilterUtil.createWfsFilter(stringSearchTerm, []);
        expect(got).toBeNull();
      });

      it ('returns simple LIKE filter if only one attribute is ' +
        'provided and exactSearch flag is false or not given', () => {
        const got = WfsFilterUtil.createWfsFilter(stringSearchTerm, searchConfig?.attributeDetails);

        expect(got?.getTagName()).toBe('PropertyIsLike');
        expect(got).toBeInstanceOf(IsLike);
        const isLikeFilter = got as IsLike;
        expect(isLikeFilter?.pattern).toEqual(`*${stringSearchTerm}*`);
        expect(isLikeFilter?.propertyName).toEqual(searchConfig?.attributeDetails[0].attributeName);
        expect(isLikeFilter?.matchCase).toEqual(searchConfig?.attributeDetails[0].matchCase);
      });

      it ('returns simple EQUALTO filter if only one attribute is provided and exactSearch flag is true', () => {
        const test: AttributeDetails = {
          type: 'int',
          attributeName: 'test',
          exactSearch: true
        };
        const got = WfsFilterUtil.createWfsFilter(digitSearchTerm, [test]);
        expect(got?.getTagName()).toBe('PropertyIsEqualTo');
        expect(got).toBeInstanceOf(EqualTo);
        const equalToFilter = got as EqualTo;
        expect(equalToFilter?.expression).toEqual(digitSearchTerm);
        expect(equalToFilter?.propertyName).toEqual(test.attributeName);
      });
    //
    //   it ('returns combined OR filter if more than one search attributes are provided', () => {
    //     searchAttributes[featureType].push(...['stringAttr1', 'stringAttr2']);
    //     attributeDetails = {
    //       'featureType': {
    //         'stringAttr1': stringAttr1,
    //         'stringAttr2': stringAttr2
    //       }
    //     };
    //
    //     const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchAttributes, attributeDetails);
    //
    //     expect(got.getTagName()).toBe('Or');
    //     expect(got.conditions.length).toEqual(searchAttributes[featureType].length);
    //   });
    });

    describe('#getCombinedRequests', () => {
      it('is defined', () => {
        expect(WfsFilterUtil.getCombinedRequests).toBeDefined();
      });

      // it('creates WFS filter for each feature type', () => {
      //   const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
      //   WfsFilterUtil.getCombinedRequests(searchOpts, searchTerm);
      //   expect(filterSpy).toHaveBeenCalledTimes(searchOpts.featureTypes.length);
      //   filterSpy.mockRestore();
      // });
      //
      // it('creates WFS GetFeature request body containing queries and filter for each feature type', () => {
      //   const got = WfsFilterUtil.getCombinedRequests(searchOpts, searchTerm);
      //   expect(got.tagName).toBe('GetFeature');
      //   expect(got.querySelectorAll('Query').length).toBe(searchOpts.featureTypes.length);
      //   got.querySelectorAll('Query').forEach(query => {
      //     expect(query.children[0].tagName).toBe('Filter');
      //     expect(query.children[0].getElementsByTagName('Literal')[0].innerHTML).toBe(`*${searchTerm}*`);
      //   });
      // });
    });
  });
});
