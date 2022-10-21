import _isNil from 'lodash/isNil';
import { equalTo, like, or } from 'ol/format/filter';
import OlFormatFilter from 'ol/format/filter/Filter';
import OlFormatWFS, { WriteGetFeatureOptions } from 'ol/format/WFS';

export type AttributeDetails = {
  attributeName: string;
  type: 'number' | 'int' | 'text';
  exactSearch?: boolean;
  matchCase?: boolean;
};

export type SearchConfig = {
  featureNS: string;
  featureTypes?: string[];
  featurePrefix: string;
  geometryName: string;
  maxFeatures: number;
  outputFormat?: string;
  srsName: string;
  wfsFormatOptions: string;
  attributeDetails: AttributeDetails[];
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
   * @param {string} featureType Name of feature type to be used in filter.
   * @param {string} searchTerm Search value.
   * @param {SearchConfig} [searchConfig] An object mapping feature types to an array of
   *   attributes that should be searched through.
   * @return {OlFormatFilter} Filter to be used with WFS GetFeature requests.
   * @private
   */
  static createWfsFilter(
    searchTerm: string,
    attributeDetails: AttributeDetails[]
  ): OlFormatFilter | null {
    if (attributeDetails.length === 0) {
      return null;
    }

    const propertyFilters = attributeDetails
      .filter(attribute => {
        const type = attribute.type;
        return !(type && (type === 'int' || type === 'number') && searchTerm.match(/[^.\d]/));
      })
      .map(attributeDetail => {
        if (attributeDetail.exactSearch) {
          return equalTo(attributeDetail.attributeName, searchTerm, attributeDetail.exactSearch);
        } else {
          return like(attributeDetail.attributeName,
            `*${searchTerm}*`, '*', '.', '!',
            attributeDetail.matchCase ?? false);
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
  static getCombinedRequests(searchConfig: SearchConfig, searchTerm: string) {
    const {
      featureNS,
      featurePrefix,
      featureTypes,
      geometryName,
      maxFeatures,
      outputFormat,
      srsName,
      wfsFormatOptions,
      attributeDetails
    } = searchConfig;

    const requests = featureTypes?.map((featureType: string): any => {
      const filter = WfsFilterUtil.createWfsFilter(searchTerm, attributeDetails);
      const propertyNames = attributeDetails.map(a => a.attributeName);
      const wfsFormatOpts: WriteGetFeatureOptions = {
        featureNS,
        featurePrefix,
        featureTypes,
        geometryName,
        maxFeatures,
        outputFormat,
        srsName,
        propertyNames
      };
      if (!_isNil(filter)) {
        wfsFormatOpts.filter = filter;
      }

      const wfsFormat: OlFormatWFS  = new OlFormatWFS(wfsFormatOpts);
      return wfsFormat.writeGetFeature(wfsFormatOpts);
    });

    if (_isNil(requests)) {
      return null;
    }
    const request = requests[0];

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
