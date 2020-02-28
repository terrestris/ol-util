/*eslint-env jest*/
import OlLayerImage from 'ol/layer/Image';
import OlSourceImageWMS from 'ol/source/ImageWMS';
import { CapabilitiesUtil } from '../index';

const layerTitle =  'OpenStreetMap WMS - by terrestris';
const layerName = 'OSM-WMS';
const abstract = 'OpenStreetMap WMS, bereitgestellt durch terrestris GmbH und Co. KG. Beschleunigt mit MapProxy (http://mapproxy.org/)';
const gfiOnlineResource = 'http://ows.terrestris.de/osm/service?';
const getMapUrl = gfiOnlineResource;
const gfiFormats = [
  'text/plain',
  'text/html',
  'application/vnd.ogc.gml'
];
const glgOnlineResource = 'http://ows.terrestris.de/osm/service?styles=&layer=OSM-WMS&service=WMS&format=image%2Fpng&sld_version=1.1.0&request=GetLegendGraphic&version=1.1.1';
const queryable = true;
const capVersion = '1.3.0';

const capabilitiesObj = {
  version: capVersion,
  Service: {
    Name: 'OGC:WMS',
    Title: 'OpenStreetMap WMS'
  },
  Capability: {
    Request: {
      GetCapabilities: {
        Format: [
          'application/vnd.ogc.wms_xml'
        ],
        DCPType: [{
          HTTP: {
            Get: {
              OnlineResource: 'http://ows.terrestris.de/osm/service?'
            }
          }
        }]
      },
      GetMap: {
        Format: [
          'image/jpeg',
          'image/png'
        ],
        DCPType: [{
          HTTP: {
            Get: {
              OnlineResource: getMapUrl
            }
          }
        }]
      },
      GetFeatureInfo: {
        Format: gfiFormats,
        DCPType: [{
          HTTP: {
            Get: {
              OnlineResource: gfiOnlineResource
            }
          }
        }]
      }
    },
    Exception: [
      'application/vnd.ogc.se_xml',
      'application/vnd.ogc.se_inimage',
      'application/vnd.ogc.se_blank'
    ],
    Layer: {
      Layer: [{
        Name: layerName,
        Title: layerTitle,
        Abstract: abstract,
        Attribution: {
          Title: '(c) OpenStreetMap contributors',
          OnlineResource: 'http://www.openstreetmap.org/copyright'
        },
        BoundingBox: [{
          crs: null,
          extent: [-20037508.3428, -25819498.5135,
            20037508.3428,
            25819498.5135
          ],
          res: [
            null,
            null
          ]
        },
        {
          crs: null,
          extent: [-180, -88,
            180,
            88
          ],
          res: [
            null,
            null
          ]
        },
        {
          crs: null,
          extent: [-20037508.3428, -25819498.5135,
            20037508.3428,
            25819498.5135
          ],
          res: [
            null,
            null
          ]
        }
        ],
        Style: [{
          Name: 'default',
          Title: 'default',
          LegendURL: [{
            Format: 'image/png',
            OnlineResource: glgOnlineResource,
            size: [
              155,
              344
            ]
          }]
        }],
        queryable: queryable,
        opaque: false,
        noSubsets: false
      }]
    }
  }
};

describe('CapabilitiesUtil', () => {

  it('is defined', () => {
    expect(CapabilitiesUtil).not.toBeUndefined();
  });

  describe('Static methods', () => {

    describe('parseWmsCapabilities', () => {
      it('isDefined', () => {
        expect(CapabilitiesUtil.parseWmsCapabilities).not.toBeUndefined();
      });

      it('creates a promise:', () => {
        const url = 'https://TO.BE/DEFINED';
        const resObj = CapabilitiesUtil.parseWmsCapabilities(url);
        expect(resObj).toBeInstanceOf(Promise);
      });
    });

    describe('getLayersFromWmsCapabilities', () => {
      it('isDefined', () => {
        expect(CapabilitiesUtil.getLayersFromWmsCapabilities).not.toBeUndefined();
      });

      it('creates layer objects from parsed WMS capabilities', () => {
        const parsedLayers = CapabilitiesUtil.getLayersFromWmsCapabilities(capabilitiesObj);
        expect(parsedLayers).toHaveLength(1);
        const layer = parsedLayers[0];
        expect(layer).toBeInstanceOf(OlLayerImage);
        expect(layer.getSource()).toBeInstanceOf(OlSourceImageWMS);
      });

      it('sets layer attributes accordingly', () => {
        const parsedLayers = CapabilitiesUtil.getLayersFromWmsCapabilities(capabilitiesObj);
        const layer = parsedLayers[0];
        const layerSource = layer.getSource();
        expect(layer.get('title')).toBe(layerTitle);
        expect(layer.get('name')).toBe(layerName);
        expect(layer.get('abstract')).toBe(abstract);
        expect(layer.get('getFeatureInfoUrl')).toBe(gfiOnlineResource);
        expect(layer.get('getFeatureInfoFormats')).toEqual(gfiFormats);
        expect(layer.get('legendUrl')).toEqual(glgOnlineResource);
        expect(layer.get('queryable')).toBe(queryable);
        expect(layerSource.getUrl()).toBe(getMapUrl);
        expect(layerSource.getAttributions().call()).toEqual(['<a target="_blank" href="http://www.openstreetmap.org/copyright">(c) OpenStreetMap contributors</a>']);
        expect(layerSource.getParams()['LAYERS']).toBe(layerName);
        expect(layerSource.getParams()['VERSION']).toBe(capVersion);
      });

      it('applies proxy function if provided', () => {
        const proxyFn = jest.fn();
        CapabilitiesUtil.getLayersFromWmsCapabilities(capabilitiesObj, 'name', proxyFn);
        expect.assertions(1);
        expect(proxyFn).toBeCalledTimes(3);
      });
    });
  });
});
