import {
  equalTo,
  like,
  or
} from 'ol/format/filter';

import OlFormatWFS from 'ol/format/WFS';

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
   * Currently supports EQUALTO and LIKE filters only, which can be combined with
   * OR filter if searchAttributes array contains multiple values though.
   *
   * @param {string} featureType Name of feature type to be used in filter.
   * @param {string} searchTerm Search value.
   * @param {Object} searchAttributes An object mapping feature types to an array of
   *   attributes that should be searched through.
   * @param {Object} attributeDetails An object mapping feature types to an
   *   array of attribute details.
   * @return {OlFormatFilter} Filter to be used with WFS GetFeature requests.
   * @private
   */
  static createWfsFilter(featureType, searchTerm, searchAttributes, attributeDetails) {

    const attributes = searchAttributes && searchAttributes[featureType];

    if (!attributes) {
      return null;
    }

    const details = attributeDetails && attributeDetails[featureType];
    const propertyFilters = attributes.map(attribute => {
      const filterDetails = details && details[attribute];
      if (filterDetails) {
        const type = filterDetails.type;
        if (type && (type === 'int' || type === 'number') && searchTerm.match(/[^.\d]/)) {
          return undefined;
        }
        if (filterDetails.exactSearch) {
          return equalTo(attribute, searchTerm, filterDetails.exactSearch);
        } else {
          return like(attribute, `*${searchTerm}*`, '*', '.', '!', filterDetails.matchCase || false);
        }
      } else {
        return like(attribute, `*${searchTerm}*`, '*', '.', '!', false);
      }
    })
      .filter(filter => filter !== undefined);
    if (attributes.length > 1 && Object.keys(propertyFilters).length > 1) {
      return or(...propertyFilters);
    } else {
      return propertyFilters[0];
    }
  }


  /**
   * Creates GetFeature request body for all provided featureTypes and
   * applies related filter encoding on it.
   *
   * @param {Object} searchOpts Search options object which has the following
   * keys (see also https://github.com/terrestris/react-geo/blob/master/src/Field/WfsSearch/
   * for further options explanations and examples):
   *   * featureNS        {String}   The namespace URI used for features
   *   * featurePrefix    {String}   The prefix for the feature namespace.
   *   * featureTypes     {String[]} The feature type names to search through.
   *   * geometryName     {String}   Geometry name to use in a BBOX filter.
   *   * maxFeatures      {Number}   Maximum number of features to fetch.
   *   * outputFormat     {String}   The output format of the response.
   *   * propertyNames    {String[]} Optional list of property names to serialize.
   *   * srsName          {String}   SRS name.
   *   * wfsFormatOptions {Object}   Options which are passed to the constructor of the ol.format.WFS
   *                                 (compare: https://openlayers.org/en/latest/apidoc/ol.format.WFS.html)
   *   * searchAttributes {Object}   An object mapping feature types to an array
   *                                 of attributes that should be searched through.
   *   * attributeDetails {Object}   A nested object mapping feature types to an
   *                                 object of attribute details, which are also
   *                                 mapped by search attribute name.
   * @param {string} searchTerm Search string to be used with filter.
   */
  static getCombinedRequests(searchOpts, searchTerm) {

    const {
      featureNS,
      featurePrefix,
      featureTypes,
      geometryName,
      maxFeatures,
      outputFormat,
      propertyNames,
      srsName,
      wfsFormatOptions,
      searchAttributes,
      attributeDetails
    } = searchOpts;

    const requests = featureTypes.map(featureType => {

      const filter = WfsFilterUtil.createWfsFilter(
        featureType, searchTerm, searchAttributes, attributeDetails
      );
      const options = {
        featureNS,
        featurePrefix,
        featureTypes: [featureType],
        geometryName,
        maxFeatures,
        outputFormat,
        propertyNames,
        srsName,
        filter: filter
      };

      const wfsFormat = new OlFormatWFS(wfsFormatOptions);
      return wfsFormat.writeGetFeature(options);
    });

    const request = requests[0];

    requests.forEach(req => {
      if (req !== request) {
        const query = req.querySelector('Query');
        request.append(query);
      }
    });

    return request;
  }
}

export default WfsFilterUtil;
