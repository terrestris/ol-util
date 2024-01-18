import { FeatureCollection } from 'geojson';
import OlFeature from 'ol/Feature';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlLayerVector from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import OlSourceVector from 'ol/source/Vector';
import shp, { FeatureCollectionWithFilename } from 'shpjs';

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
  static addGeojsonLayerFromFile(file: File, map: OlMap): void {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('loadend', () => {
      const content = reader.result as string;
      FileUtil.addGeojsonLayer(content, map);
    });
  }

  /**
   * Adds a new vector layer from a shape file (zip).
   * @param {File} file the file to read the geojson from
   * @param {import("ol/Map").default} map the map to add the layer to
   */
  static addShpLayerFromFile(file: File, map: OlMap): void {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('loadend', () => {
      const blob = reader.result as ArrayBuffer;
      shp(blob).then((json: FeatureCollectionWithFilename | FeatureCollectionWithFilename[]) => {
        FileUtil.addGeojsonLayer(json, map);
      });
    });
  }

  /**
   * Adds a new vector layer from a geojson string.
   * @param {string|object} json the geojson string or object
   * @param {import("ol/Map").default} map the map to add the layer to
   */
  static addGeojsonLayer(json: string | FeatureCollection | FeatureCollection[], map: OlMap) {
    const format = new OlFormatGeoJSON();
    const features = format.readFeatures(json) as OlFeature[];
    const layer = new OlLayerVector({
      source: new OlSourceVector({
        features: features
      })
    });
    map.addLayer(layer);
  }

}

export default FileUtil;
