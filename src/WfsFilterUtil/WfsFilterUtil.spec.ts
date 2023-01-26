/* eslint-env jest*/
import EqualTo from 'ol/format/filter/EqualTo';
import IsLike from 'ol/format/filter/IsLike';
import Or from 'ol/format/filter/Or';

import WfsFilterUtil, { AttributeSearchSettings, SearchConfig } from './WfsFilterUtil';

describe('WfsFilterUtil', () => {

  const featureType = 'featureType';
  const attrName = 'testAttribute';
  const anotherAttrName = 'anotherTestAttribute';

  const stringExactFalse: AttributeSearchSettings = {
    matchCase: false,
    type: 'string',
    exactSearch: false
  };
  const stringExactTrue: AttributeSearchSettings = {
    matchCase: false,
    type: 'string',
    exactSearch: true
  };
  const intExactTrue: AttributeSearchSettings = {
    matchCase: false,
    type: 'int',
    exactSearch: true
  };
  const intExactFalse: AttributeSearchSettings = {
    matchCase: false,
    type: 'int',
    exactSearch: false
  };

  const searchConfig: SearchConfig = {
    featureNS: 'test',
    featureTypes: [featureType],
    featurePrefix: 'test',
    propertyNames: ['testAttribute', 'anotherTestAttribute'],
    attributeDetails: {
      featureType: {}
    }
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

      it('returns null if no search attributes for the provided feature type are found', () => {
        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, {});
        expect(got).toBeNull();
      });

      it('returns simple LIKE filter if only one attribute is provided and ' +
        'exactSearch flag is false or not given', () => {
        searchConfig.attributeDetails.featureType[attrName] = stringExactFalse;
        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchConfig.attributeDetails);

        expect(got?.getTagName()).toBe('PropertyIsLike');
        expect(got).toBeInstanceOf(IsLike);
        const isLikeFilter = got as IsLike;
        expect(isLikeFilter?.pattern).toEqual(`*${stringSearchTerm}*`);
        expect(isLikeFilter?.propertyName).toEqual(attrName);
        expect(isLikeFilter?.matchCase).toEqual(stringExactFalse.matchCase);
      });

      it('returns simple EQUALTO filter if only one attribute is provided and exactSearch flag is true', () => {
        searchConfig.attributeDetails.featureType[attrName] = stringExactTrue;
        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchConfig.attributeDetails);
        expect(got?.getTagName()).toBe('PropertyIsEqualTo');
        expect(got).toBeInstanceOf(EqualTo);
        const equalToFilter = got as EqualTo;
        expect(equalToFilter?.expression).toEqual(stringSearchTerm);
        expect(equalToFilter?.propertyName).toEqual(attrName);
      });

      it('returns simple EQUALTO filter for numeric attributes if exactSearch flag is true', () => {
        searchConfig.attributeDetails.featureType[attrName] = intExactTrue;
        let got = WfsFilterUtil.createWfsFilter(featureType, digitSearchTerm, searchConfig.attributeDetails);
        expect(got?.getTagName()).toBe('PropertyIsEqualTo');
        expect(got).toBeInstanceOf(EqualTo);
        const equalToFilter = got as EqualTo;
        expect(equalToFilter?.expression).toEqual(digitSearchTerm);
        expect(equalToFilter?.propertyName).toEqual(attrName);
      });

      it('returns simple LIKE filter for numeric attributes if exactSearch flag is false', () => {
        searchConfig.attributeDetails.featureType[attrName] = intExactFalse;
        let got = WfsFilterUtil.createWfsFilter(featureType, digitSearchTerm, searchConfig.attributeDetails);
        expect(got?.getTagName()).toBe('PropertyIsLike');
        expect(got).toBeInstanceOf(IsLike);
        const isLikeFilter = got as IsLike;
        expect(isLikeFilter?.pattern).toEqual(`*${digitSearchTerm}*`);
        expect(isLikeFilter?.propertyName).toEqual(attrName);
        expect(isLikeFilter?.matchCase).toEqual(stringExactFalse.matchCase);
      });

      it('returns combined OR filter if more than one search attributes are provided', () => {
        searchConfig.attributeDetails.featureType[attrName] = stringExactTrue;
        searchConfig.attributeDetails.featureType[anotherAttrName] = stringExactFalse;

        const got = WfsFilterUtil.createWfsFilter(featureType, stringSearchTerm, searchConfig.attributeDetails);
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

      it('tries to create WFS filter for each feature type', () => {
        const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
        const searchTerm: string = 'peter';
        WfsFilterUtil.getCombinedRequests(searchConfig, searchTerm);
        expect(filterSpy).toHaveBeenCalledTimes(searchConfig.featureTypes!.length);
        filterSpy.mockRestore();
      });

      it('creates WFS GetFeature request body containing queries and filter for each feature type', () => {
        const filterSpy = jest.spyOn(WfsFilterUtil, 'createWfsFilter');
        const searchTerm: string = 'peter';
        searchConfig.attributeDetails.featureType[attrName] = stringExactFalse;
        const got = WfsFilterUtil.getCombinedRequests(searchConfig, searchTerm) as Element;
        expect(got?.tagName).toBe('GetFeature');
        expect(got.querySelectorAll('Query').length).toBe(searchConfig.featureTypes!.length);
        expect(filterSpy).toHaveBeenCalledTimes(searchConfig.featureTypes!.length);
        got.querySelectorAll('Query').forEach(query => {
          expect(query.children[2].tagName).toBe('Filter');
          expect(query.children[2].getElementsByTagName('Literal')[0].innerHTML).toBe(`*${searchTerm}*`);
        });
      });
    });
  });
});
