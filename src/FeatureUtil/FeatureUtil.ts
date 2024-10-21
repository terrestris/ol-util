import _isArray from 'lodash/isArray';
import _isNil from 'lodash/isNil';
import _isString from 'lodash/isString';
import OlFeature from 'ol/Feature';
import OlGeometry from 'ol/geom/Geometry';

import StringUtil from '@terrestris/base-util/dist/StringUtil/StringUtil';

/**
 * Helper class for working with OpenLayers features.
 *
 * @class FeatureUtil
 */
class FeatureUtil {

  /**
   * Returns the featureType name out of a given feature. It assumes that
   * the feature has an ID in the following structure FEATURETYPE.FEATUREID.
   *
   * @param {import("ol/Feature").default} feature The feature to obtain the featureType
   *                             name from.
   * @return {string|undefined} The (unqualified) name of the featureType or undefined if
   *                  the name could not be picked.
   */
  static getFeatureTypeName(feature: OlFeature<OlGeometry>): string | undefined {
    const featureId = feature.getId();
    const featureIdParts = _isString(featureId) ? featureId.split('.') : featureId;
    return _isArray(featureIdParts) ? featureIdParts[0] : undefined;
  }

  /**
   * Extracts the featureType name from given GetFeatureInfo URL.
   * This method is mostly useful for raster layers which features could have
   * no ID set.
   *
   * @param {string} url GetFeatureInfo URL possibly containing featureType name.
   * @param {boolean} qualified Whether the qualified featureType name should be
   *   returned or not. Default is true.
   *
   * @return {string|undefined} Obtained featureType name as string.
   */
  static getFeatureTypeNameFromGetFeatureInfoUrl(url: string, qualified: boolean = true): string | undefined {
    const regex = /query_layers=(.*?)(&|$)/i;
    const match = url.match(regex);
    let featureTypeName;
    if (match && match[1]) {
      featureTypeName = decodeURIComponent(match[1]);
      if (!qualified && featureTypeName.indexOf(':') > 0) {
        featureTypeName = featureTypeName.split(':')[1];
      }
    }
    return featureTypeName;
  }

  /**
   * Resolves the given template string with the given feature attributes, e.g.
   * the template "Size of area is {{AREA_SIZE}} km²" would be to resolved
   * to "Size of area is 1909 km²" (assuming the feature's attribute AREA_SIZE
   * really exists).
   *
   * @param {import("ol/Feature").default} feature The feature to get the attributes from.
   * @param {string} template The template string to resolve.
   * @param {string} [noValueFoundText] The text to apply, if the templated value
   *   could not be found, default is to 'n.v.'.
   * @param {(key: string, val: string) => string} [valueAdjust] A method that will be called with each
   *   key/value match, we'll use what this function returns for the actual
   *   replacement. Optional, defaults to a function which will return the raw
   *   value it received. This can be used for last minute adjustments before
   *   replacing happens, e.g. to filter out falsy values or to do number
   *   formatting and such.
   * @param {boolean} leaveAsUrl If set to true, template won't be wrapped into
   *   <a>-tag and will be returned as URL. Default is false.
   * @return {string} The resolved template string.
   */
  static resolveAttributeTemplate(
    feature: OlFeature<OlGeometry>,
    template: string,
    noValueFoundText: string = 'n.v.',
    valueAdjust = (key: string, val: any) => val,
    leaveAsUrl = false
  ) {
    const attributeTemplatePrefix = '\\{\\{';
    const attributeTemplateSuffix = '\\}\\}';
    let resolved;

    // Find any character between two braces (including the braces in the result)
    const regExp = new RegExp(attributeTemplatePrefix + '(.*?)' + attributeTemplateSuffix, 'g');
    const regExpRes = _isString(template) ? template.match(regExp) : null;

    // If we have a regex result, it means we found a placeholder in the
    // template and have to replace the placeholder with its appropriate value.
    if (regExpRes) {
      // Iterate over all regex match results and find the proper attribute
      // for the given placeholder, finally set the desired value to the hover.
      // field text
      regExpRes.forEach((res) => {
        // We count every candidate that is not matching. If this count is equal to
        // the object array length, we assume that there is no match at all and
        // set the output value to the value of "noValueFoundText".
        let noMatchCnt = 0;

        for (const [key, value] of Object.entries(feature.getProperties())) {
          // Remove the suffixes and find the matching attribute column.
          const attributeName = res.slice(2, res.length - 2);

          if (attributeName.toLowerCase() === key.toLowerCase()) {
            template = template.replace(res, valueAdjust(key, value));
            break;
          } else {
            noMatchCnt++;
          }
        }

        // No key match found for this feature (e.g. if key not
        // present or value is null).
        if (noMatchCnt === Object.keys(feature.getProperties()).length) {
          template = template.replace(res, noValueFoundText);
        }
      });
    }

    resolved = template;

    // Fallback if no feature attribute is found.
    if (!resolved) {
      resolved = `${feature.getId()}`;
    }

    if (!leaveAsUrl) {
      // Replace any HTTP url with an <a> element.
      resolved = StringUtil.urlify(resolved);

      // Replace all newline breaks with a html <br> tag.
      resolved = resolved.replace(/\n/g, '<br>');
    }

    return resolved;
  }

  /**
   * Maps an array of features to an array of geometries.
   *
   * @param {import("ol/Feature").default[]} features
   * @return {import("ol/Geometry").default[]} The geometries of the features
   */
  static mapFeaturesToGeometries(features: OlFeature<OlGeometry>[]): OlGeometry[] {
    return features
      .filter(feature => !_isNil(feature.getGeometry()))
      .map(f => f.getGeometry() as OlGeometry);
  }

}

export default FeatureUtil;
