import _isNil from 'lodash/isNil';
import { equalTo, like, or } from 'ol/format/filter';
import OlFormatFilter from 'ol/format/filter/Filter';
import OlFormatWFS, { WriteGetFeatureOptions } from 'ol/format/WFS';

export type AttributeSearchSettings = {
  type: 'number' | 'int' | 'string';
  exactSearch?: boolean;
  matchCase?: boolean;
};

/**
 * A nested object mapping feature types to an object of their attribute details.
 *
 * Example:
 *   ```
 *   attributeDetails: {
 *    featType1: {
 *      attr1: {
 *        matchCase: true,
 *        type: 'number',
 *        exactSearch: false
 *      },
 *      attr2: {
 *        matchCase: false,
 *        type: 'string',
 *        exactSearch: true
 *      }
 *    },
 *    featType2: {...}
 *   }
 *   ```
 */
export type AttributeDetails = {
  [featureType: string]: {
    [attributeName: string]: AttributeSearchSettings;
  };
};

export type SearchConfig = {
  featureNS: string;
  featureTypes?: string[];
  featurePrefix: string;
  geometryName?: string;
  maxFeatures?: number;
  outputFormat?: string;
  srsName?: string;
  wfsFormatOptions?: string;
  attributeDetails: AttributeDetails;
};

/**
 * Helper class for building filters to be used with WFS GetFeature requests.
 *
 * @class WfsFilterUtil
 */
class WfsFilterUtil {

  /**
   * Creates a filter for a given feature type considering configured
   * search attributes, mapped features types to an array of attribute details and the
   * current search term.
   * Currently, supports EQUALTO and LIKE filters only, which can be combined with
   * OR filter if searchAttributes array contains multiple values though.
   *
   * @param {string} searchTerm Search value.
   * @param attributeDetails
   *   attributes that should be searched through.
   * @return {OlFormatFilter} Filter to be used with WFS GetFeature requests.
   * @private
   */
  static createWfsFilter(
    featureType: string,
    searchTerm: string,
    attributeDetails: AttributeDetails
  ): OlFormatFilter | null {

    const details = attributeDetails[featureType];

    if (!details) {
      return null;
    }

    const attributes = Object.keys(details);

    if (attributes.length === 0) {
      return null;
    }

    const propertyFilters = attributes
      .filter(attribute => {
        const filterDetails = details[attribute];
        const type = filterDetails.type;
        return !(type && (type === 'int' || type === 'number') && searchTerm.match(/[^.\d]/));
      })
      .map(attribute => {
        const filterDetails = details[attribute];
        if (filterDetails.exactSearch) {
          return equalTo(attribute, searchTerm, filterDetails.exactSearch);
        } else {
          return like(attribute,
            `*${searchTerm}*`, '*', '.', '!',
            filterDetails.matchCase ?? false);
        }
      });
    if (Object.keys(propertyFilters).length > 1) {
      return or(...propertyFilters);
    } else {
      return propertyFilters[0];
    }
  }

  /**
   * Creates GetFeature request body for all provided featureTypes and
   * applies related filter encoding on it.
   *
   * @param {SearchConfig} searchConfig The search config
   * @param {string} searchTerm Search string to be used with filter.
   */
  static getCombinedRequests(searchConfig: SearchConfig, searchTerm: string): Element | undefined {
    const {
      featureNS,
      featurePrefix,
      featureTypes,
      geometryName,
      maxFeatures,
      outputFormat,
      srsName,
      attributeDetails
    } = searchConfig;

    const requests = featureTypes?.map((featureType: string): any => {
      const filter = WfsFilterUtil.createWfsFilter(featureType, searchTerm, attributeDetails);
      const propertyNames = Object.keys(attributeDetails[featureType]);
      const wfsFormatOpts: WriteGetFeatureOptions = {
        featureNS,
        featurePrefix,
        featureTypes,
        geometryName,
        maxFeatures,
        outputFormat,
        srsName
      };

      if (!_isNil(propertyNames)) {
        wfsFormatOpts.propertyNames = propertyNames;
      }
      if (!_isNil(filter)) {
        wfsFormatOpts.filter = filter;
      }

      const wfsFormat: OlFormatWFS = new OlFormatWFS(wfsFormatOpts);
      return wfsFormat.writeGetFeature(wfsFormatOpts);
    });

    if (_isNil(requests)) {
      return;
    }
    const request = requests[0] as Element;

    requests.forEach((req: any) => {
      if (req !== request) {
        const query = req.contains('Query');
        if (query !== null) {
          request.append(query);
        }
      }
    });

    return request;
  }
}

export default WfsFilterUtil;
