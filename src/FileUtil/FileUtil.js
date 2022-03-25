import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayerVector from 'ol/layer/Vector';
import OlSourceVector from 'ol/source/Vector';
import shp from 'shpjs';

/**
 * Helper class for adding layers from various file formats.
 *
 * @class
 */
export class FileUtil {

  /**
   * Adds a new vector layer from a geojson file.
   * @param {File} file the file to read the geojson from
   * @param {import("ol/Map").default} map the map to add the layer to
   */
  static addGeojsonLayerFromFile(file, map) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('loadend', () => {
      const content = reader.result;
      FileUtil.addGeojsonLayer(/** @type {string} */ (content), map);
    });
  }

  /**
   * Adds a new vector layer from a shape file (zip).
   * @param {File} file the file to read the geojson from
   * @param {import("ol/Map").default} map the map to add the layer to
   */
  static addShpLayerFromFile(file, map) {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('loadend', () => {
      const blob = /** @type {ArrayBuffer} */(reader.result);
      shp(blob).then(json => {
        FileUtil.addGeojsonLayer(json, map);
      });
    });
  }

  /**
   * Adds a new vector layer from a geojson string.
   * @param {string|object} json the geojson string or object
   * @param {import("ol/Map").default} map the map to add the layer to
   */
  static addGeojsonLayer(json, map) {
    const format = new OlFormatGeoJSON();
    const features = format.readFeatures(json);
    const layer = new OlLayerVector({
      source: new OlSourceVector({
        features: features
      })
    });
    map.addLayer(layer);
  }

}

export default FileUtil;
