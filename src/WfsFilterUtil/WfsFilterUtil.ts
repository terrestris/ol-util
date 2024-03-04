import _isNil from 'lodash/isNil';
import { and, equalTo, like, or } from 'ol/format/filter';
import OlFilter from 'ol/format/filter/Filter';
import OlFormatWFS, { WriteGetFeatureOptions } from 'ol/format/WFS';

export type AttributeSearchSettings = {
  exactSearch?: boolean;
  matchCase?: boolean;
  type: 'number' | 'int' | 'string';
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
  attributeDetails: AttributeDetails;
  featureNS: string;
  featurePrefix: string;
  featureTypes?: string[];
  filter?: OlFilter;
  geometryName?: string;
  maxFeatures?: number;
  olFilterOnly?: boolean;
  outputFormat?: string;
  propertyNames?: string[];
  srsName?: string;
  wfsFormatOptions?: string;
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
   * Currently, supports EQUAL_TO and LIKE filters only, which can be combined with
   * OR filter if searchAttributes array contains multiple values though.
   *
   * @param featureType
   * @param {string} searchTerm Search value.
   * @param attributeDetails
   *   attributes that should be searched through.
   * @return {OlFilter} Filter to be used with WFS GetFeature requests.
   * @private
   */
  static createWfsFilter(
    featureType: string,
    searchTerm: string,
    attributeDetails: AttributeDetails
  ): OlFilter | undefined {

    const details = attributeDetails[featureType];

    if (_isNil(details)) {
      return;
    }

    const attributes = Object.keys(details);

    if (attributes.length === 0) {
      return;
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
      attributeDetails,
      featureNS,
      featurePrefix,
      featureTypes,
      filter,
      geometryName,
      maxFeatures,
      olFilterOnly,
      outputFormat,
      propertyNames,
      srsName
    } = searchConfig;

    const requests = featureTypes?.map((featureType: string): any => {
      let combinedFilter: OlFilter | undefined;

      // existing OlFilter should be applied to attribute
      if (olFilterOnly && !_isNil(filter)) {
        combinedFilter = filter;
      } else {
        const attributeFilter = WfsFilterUtil.createWfsFilter(featureType, searchTerm, attributeDetails);
        if (!_isNil(filter) && !_isNil(attributeFilter)) {
          combinedFilter = and(attributeFilter, filter);
        } else {
          combinedFilter = attributeFilter;
        }
      }

      const wfsFormatOpts: WriteGetFeatureOptions = {
        featureNS,
        featurePrefix,
        featureTypes: [featureType],
        geometryName,
        maxFeatures,
        outputFormat,
        srsName
      };

      if (!_isNil(propertyNames)) {
        wfsFormatOpts.propertyNames = propertyNames;
      }
      if (!_isNil(combinedFilter)) {
        wfsFormatOpts.filter = combinedFilter;
      }

      const wfsFormat: OlFormatWFS = new OlFormatWFS(wfsFormatOpts);
      return wfsFormat.writeGetFeature(wfsFormatOpts);
    });

    if (_isNil(requests)) {
      return;
    }
    const request = requests[0];
    requests.forEach((req, idx) => {
      if (idx !== 0 && req.querySelector('Query')) {
        request.appendChild(req.querySelector('Query'));
      }
    });
    return request;
  }
}

export default WfsFilterUtil;
