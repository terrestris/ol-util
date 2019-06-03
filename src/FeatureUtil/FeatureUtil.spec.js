/*eslint-env jest*/

import OlFeature from 'ol/Feature';
import OlGeomPoint from 'ol/geom/Point';

import {
  FeatureUtil,
} from '../index';

describe('FeatureUtil', () => {
  let coords;
  let geom;
  let props;
  let feat;
  let featId;

  beforeEach(() => {
    featId = 'BVB.BORUSSIA';
    coords = [1909, 1909];
    geom = new OlGeomPoint({
      coordinates: coords
    });
    props = {
      name: 'Shinji Kagawa',
      address: 'Borsigplatz 9',
      city: 'Dortmund',
      homepage: 'https://www.bvb.de/',
      'exists-and-is-undefined': undefined,
      'exists-and-is-null': null
    };
    feat = new OlFeature({
      geometry: geom
    });

    feat.setProperties(props);
    feat.setId(featId);
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(FeatureUtil).toBeDefined();
    });
  });

  describe('Static methods', () => {
    describe('#getFeatureTypeName', () => {
      it('splits the feature ID at the point character and returns the first part', () => {
        let got = FeatureUtil.getFeatureTypeName(feat);
        expect(got).toBe(featId.split('.')[0]);

        feat.setId('BVB');
        got = FeatureUtil.getFeatureTypeName(feat);
        expect(got).toBe('BVB');
      });

      it('returns undefined if the ID is not set', () => {
        feat.setId(null);
        let got = FeatureUtil.getFeatureTypeName(feat);
        expect(got).toBe(undefined);
      });
    });

    describe('#getFeatureTypeNameFromGetFeatureInfoUrl', () => {

      it('extracts layer name from provided GetFeatureInfo request URL', () => {

        const layerName = 'testLayerName';
        const ns = 'ns';
        const mockUrlUnqualified = `http://mock.de?&REQUEST=GetFeatureInfo&QUERY_LAYERS=${layerName}&TILED=true`;
        const mockUrlQualified = `http://mock.de?&REQUEST=GetFeatureInfo&QUERY_LAYERS=${ns}:${layerName}&TILED=true`;
        const mockUrlQualified2 = `http://mock.de?&REQUEST=GetFeatureInfo&QUERY_LAYERS=${ns}:${layerName}`;

        const gotUnqualified = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(mockUrlUnqualified);
        const gotQualified = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(mockUrlQualified);
        const gotQualified2 = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(mockUrlQualified2);
        const gotQualifiedSplitted = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(mockUrlQualified, false);
        const gotQualifiedSplitted2 = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(mockUrlQualified2, false);

        expect(gotUnqualified).toBe(layerName);
        expect(gotQualified).toBe(`${ns}:${layerName}`);
        expect(gotQualified2).toBe(`${ns}:${layerName}`);
        expect(gotQualifiedSplitted).toBe(layerName);
        expect(gotQualifiedSplitted2).toBe(layerName);
      });

      it('returns undefined if no match was found', () => {

        const notMatchingUrl = `http://mock.de?&REQUEST=GetFeatureInfo&SOME_PARAMS=some_values`;
        const got = FeatureUtil.getFeatureTypeNameFromGetFeatureInfoUrl(notMatchingUrl);
        expect(got).toBeUndefined();
      });
    });


    describe('#resolveAttributeTemplate', () => {
      it('resolves the given template string with the feature attributes', () => {
        let template = '{{name}}';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(props.name);

        // It's case insensitive.
        template = '{{NAmE}}';
        got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(props.name);

        // It resolves static and non-static content.
        template = 'Contact information: {{name}} {{address}} {{city}}';
        got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(`Contact information: ${props.name} ${props.address} ${props.city}`);

        // It doesn't harm the template if not attribute placeholder is given.
        template = 'No attribute template';
        got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(template);
      });

      it('can be configured wrt handling inexistant / falsy values', () => {
        let template = '{{exists-and-is-undefined}}|{{exists-and-is-null}}|{{key-does-not-exist}}';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe('undefined|null|n.v.');
        got = FeatureUtil.resolveAttributeTemplate(feat, template, '', (key, val) => {return val ? val : '';});
        expect(got).toBe('||');
        const mockFn = jest.fn(() => {return 'FOO';});
        got = FeatureUtil.resolveAttributeTemplate(feat, template, '', mockFn);
        expect(mockFn.mock.calls.length).toBe(2);
        expect(mockFn.mock.calls[0][0]).toBe('exists-and-is-undefined');
        expect(mockFn.mock.calls[0][1]).toBe(undefined);
        expect(mockFn.mock.calls[1][0]).toBe('exists-and-is-null');
        expect(mockFn.mock.calls[1][1]).toBe(null);
        expect(got).toBe('FOO|FOO|');
      });

      it('wraps an URL occurence with an <a> tag', () => {
        let template = '{{homepage}}';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(`<a href="${props.homepage}" target="_blank">${props.homepage}</a>`);
      });

      it('resolves it with a placeholder if attribute could not be found', () => {
        let template = '{{notAvailable}}';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe('n.v.');

        template = '{{name}} {{notAvailable}}';
        got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(`${props.name} n.v.`);

        // The placeholder is configurable.
        let notFoundPlaceHolder = '【ツ】';
        template = '{{name}} {{notAvailable}}';
        got = FeatureUtil.resolveAttributeTemplate(feat, template, notFoundPlaceHolder);
        expect(got).toBe(`${props.name} ${notFoundPlaceHolder}`);
      });

      it('returns the id of the feature if no template is given', () => {
        let template = '';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(featId);

        got = FeatureUtil.resolveAttributeTemplate(feat);
        expect(got).toBe(featId);
      });

      it('replaces newline chars with a <br> tag', () => {
        let template = '{{name}} \n {{city}}';
        let got = FeatureUtil.resolveAttributeTemplate(feat, template);
        expect(got).toBe(`${props.name} <br> ${props.city}`);
      });
    });

  });

});
