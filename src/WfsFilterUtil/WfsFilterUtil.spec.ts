/* eslint-env jest*/
import EqualTo from 'ol/format/filter/EqualTo';
import IsLike from 'ol/format/filter/IsLike';
import Or from 'ol/format/filter/Or';

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

      it ('returns combined OR filter if more than one search attributes are provided', () => {
        const test1: AttributeDetails = {
          attributeName: 'test1',
          type: 'string'
        };

        const test2: AttributeDetails = {
          attributeName: 'test2',
          type: 'string'
        };

        const got = WfsFilterUtil.createWfsFilter(digitSearchTerm, [test1, test2]);
        expect(got?.getTagName()).toBe('Or');
        expect(got).toBeInstanceOf(Or);
        const orFilter = got as Or;
        expect(orFilter?.conditions.length).toEqual(2);
      });
    });

    describe('#getCombinedRequests', () => {
      it('is defined', () => {
        expect(WfsFilterUtil.getCombinedRequests).toBeDefined();
      });

      it('creates WFS filter for each feature type', () => {
        const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
        const searchTerm: string = 'peter';
        WfsFilterUtil.getCombinedRequests(searchConfig, searchTerm);
        expect(filterSpy).toHaveBeenCalledTimes(searchConfig.attributeDetails.length);
        filterSpy.mockRestore();
      });

      it('creates WFS GetFeature request body containing queries and filter for each feature type', () => {
        const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
        const searchTerm: string = 'peter';
        const got = WfsFilterUtil.getCombinedRequests(searchConfig, searchTerm) as Element;
        expect(got?.tagName).toBe('GetFeature');
        expect(filterSpy).toHaveBeenCalledTimes(searchConfig.attributeDetails.length);
        expect(got?.getRootNode()?.firstChild?.textContent).toContain(`*${searchTerm}*`);
      });
    });
  });
});
