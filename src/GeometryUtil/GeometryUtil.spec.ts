/* eslint-env jest*/

import OlFeature from 'ol/Feature';
import OlFormatGeoJSON from 'ol/format/GeoJSON';
import OlGeometry from 'ol/geom/Geometry';
import OlGeomLineString from 'ol/geom/LineString';
import OlGeomMultiLineString from 'ol/geom/MultiLineString';
import OlGeomMultiPoint from 'ol/geom/MultiPoint';
import OlGeomMultiPolygon from 'ol/geom/MultiPolygon';
import OlGeomPoint from 'ol/geom/Point';
import OlGeomPolygon from 'ol/geom/Polygon';

import GeometryUtil from './GeometryUtil';
import {
  boxCoords,
  boxCoords2,
  boxCoords3,
  boxCoords4, differenceBoxCoords,
  expectedMultiPolygon,
  holeCoords2,
  holeCoords2CutLine,
  holeCoords2ExpPoly1,
  holeCoords2ExpPoly2,
  holeCoords2ExpPoly3, intersectionCoords,
  lineStringCoords,
  lineStringCoords2,
  lineStringLFormedCoords,
  mergedBoxCoords,
  mergedLineStringCoordinates,
  mergedPointCoordinates,
  mergedPointCoordinates2,
  pointCoords,
  pointCoords2,
  pointCoords3,
  pointCoords4,
  splitBoxCoords1,
  splitBoxCoords2,
  splitBoxLFormedCoords1,
  splitBoxLFormedCoords2,
  splitUFormerdCoords1,
  splitUFormerdCoords2,
  splitUFormerdCoords3,
  uFormedPolygonCoords,
  unionedBoxCoordinates
} from './TestCoords';

describe('GeometryUtil', () => {
  let polygonFeature: OlFeature<OlGeomPolygon>;
  let polygonGeometry: OlGeomPolygon;

  let format: OlFormatGeoJSON;

  beforeEach(() => {
    format = new OlFormatGeoJSON();

    polygonFeature = new OlFeature({
      geometry: new OlGeomPolygon(boxCoords)
    });
  });

  describe('Basics', () => {
    it('is defined', () => {
      expect(GeometryUtil).toBeDefined();
    });
  });

  describe('Static methods', () => {
    describe('#splitByLine', () => {
      describe('with ol.Feature as params', () => {
        /**
         *          +
         *          |
         *   +-------------+
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   +-------------+
         *          |
         *          +
         */
        it('splits the given convex polygon geometry with a straight line', () => {
          const line = new OlFeature({
            geometry: new OlGeomLineString(lineStringCoords)
          });
          const got: OlFeature<OlGeomPolygon>[] =
            GeometryUtil.splitByLine(polygonFeature, line, 'EPSG:4326') as OlFeature<OlGeomPolygon>[];
          const exp = [
            new OlFeature({
              geometry: new OlGeomPolygon(splitBoxCoords1)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(splitBoxCoords2)
            })
          ];
          expect(format.writeFeatures(got)).toEqual(format.writeFeatures(exp));
        });

        /**
         *          +
         *          |
         *   +-------------+
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      +---------+
         *   |             |
         *   |             |
         *   +-------------+
         */
        it('splits the given convex polygon geometry with a more complex line', () => {
          const line = new OlFeature({
            geometry: new OlGeomLineString(lineStringLFormedCoords)
          });
          const got = GeometryUtil.splitByLine(polygonFeature, line, 'EPSG:4326') as OlFeature<OlGeomPolygon>[];
          const exp = [
            new OlFeature({
              geometry: new OlGeomPolygon(splitBoxLFormedCoords1)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(splitBoxLFormedCoords2)
            })
          ];
          expect(format.writeFeatures(got)).toEqual(format.writeFeatures(exp));
        });

        /**
         *       +----+         +----+
         *       |    |         |    |
         *       |    |         |    |
         * +--------------------------------+
         *       |    |         |    |
         *       |    +---------+    |
         *       |                   |
         *       |                   |
         *       |                   |
         *       |                   |
         *       +-------------------+
         *
         */
        it('splits the given concave polygon geometry with a straight line', () => {
          polygonFeature = new OlFeature({
            geometry: new OlGeomPolygon(uFormedPolygonCoords)
          });
          const line = new OlFeature({
            geometry: new OlGeomLineString(lineStringCoords2)
          });
          const got = GeometryUtil.splitByLine(polygonFeature, line, 'EPSG:4326') as OlFeature<OlGeomPolygon>[];
          const exp = [
            new OlFeature({
              geometry: new OlGeomPolygon(splitUFormerdCoords1)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(splitUFormerdCoords2)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(splitUFormerdCoords3)
            })
          ];
          expect(format.writeFeatures(got)).toEqual(format.writeFeatures(exp));
        });

        /**
         *          +-------------------+
         *          |                   |
         *    +     |    +---------+    |
         *    |\    |    |         |    |
         *    | \   |    |         |    |
         * +----------------------------------+
         *    |  \  |    |         |    |
         *    |   \ |    +---------+    |
         *    |    \|                   |
         *    |     +                   |
         *    |                         |
         *    +------------------------ +
         *
         */
        it('splits a complex polygon geometry (including hole) with a straight line',() => {
          polygonFeature = new OlFeature({
            geometry: new OlGeomPolygon(holeCoords2)
          });
          const line = new OlFeature({
            geometry: new OlGeomLineString(holeCoords2CutLine)
          });
          const got = GeometryUtil.splitByLine(polygonFeature, line, 'EPSG:4326') as OlFeature<OlGeomPolygon>[];
          const exp: OlFeature<OlGeomPolygon>[] = [
            new OlFeature({
              geometry: new OlGeomPolygon(holeCoords2ExpPoly1)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(holeCoords2ExpPoly2)
            }),
            new OlFeature({
              geometry: new OlGeomPolygon(holeCoords2ExpPoly3)
            })
          ];
          expect(got.length).toBe(3);
          got.forEach((polygon, i) => {
            polygon?.getGeometry()?.getCoordinates()[0].sort().forEach(coord=>{
              coord.forEach(()=>{
                expect(exp[i]!.getGeometry()!.getCoordinates()[0].sort()).toContainEqual(coord);
              });
            });
          });
        });
      });
      describe('with ol.geom.Geometry as params', () => {
        /**
         *          +
         *          |
         *   +-------------+
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   +-------------+
         *          |
         *          +
         */
        it('splits the given convex polygon geometry with a straight line', () => {
          polygonGeometry = new OlGeomPolygon(boxCoords);
          const line = new OlGeomLineString(lineStringCoords);
          const got = GeometryUtil.splitByLine(polygonGeometry, new OlFeature(line), 'EPSG:4326') as OlGeomPolygon[];
          const exp = [
            new OlGeomPolygon(splitBoxCoords1),
            new OlGeomPolygon(splitBoxCoords2)
          ];
          got.forEach((polygon, i) => {
            expect(polygon.getCoordinates()).toEqual(exp[i].getCoordinates());
          });
        });

        /**
         *          +
         *          |
         *   +-------------+
         *   |      |      |
         *   |      |      |
         *   |      |      |
         *   |      +---------+
         *   |             |
         *   |             |
         *   +-------------+
         */
        it('splits the given convex polygon geometry with a more complex line', () => {
          polygonGeometry = new OlGeomPolygon(boxCoords);
          const line = new OlGeomLineString(lineStringLFormedCoords);
          const got = GeometryUtil.splitByLine(polygonGeometry, new OlFeature(line), 'EPSG:4326') as OlGeomPolygon[];
          const exp = [
            new OlGeomPolygon(splitBoxLFormedCoords1),
            new OlGeomPolygon(splitBoxLFormedCoords2)
          ];
          got.forEach((polygon, i) => {
            expect(polygon.getCoordinates()).toEqual(exp[i].getCoordinates());
          });
        });

        /**
         *       +----+         +----+
         *       |    |         |    |
         *       |    |         |    |
         * +--------------------------------+
         *       |    |         |    |
         *       |    +---------+    |
         *       |                   |
         *       |                   |
         *       |                   |
         *       |                   |
         *       +-------------------+
         *
         */
        it('splits the given concave polygon geometry with a straight line', () => {
          polygonGeometry = new OlGeomPolygon(uFormedPolygonCoords);
          const line = new OlGeomLineString(lineStringCoords2);
          const got = GeometryUtil.splitByLine(polygonGeometry, new OlFeature(line), 'EPSG:4326') as OlGeomPolygon[];
          const exp = [
            new OlGeomPolygon(splitUFormerdCoords1),
            new OlGeomPolygon(splitUFormerdCoords2),
            new OlGeomPolygon(splitUFormerdCoords3)
          ];
          got.forEach((polygon, i) => {
            expect(polygon.getCoordinates()).toEqual(exp[i].getCoordinates());
          });
        });
      });
    });

    // describe('#addBuffer', () => {
    //   describe('with ol.Feature as params', () => {
    //     it('adds a buffer to an ol.geom.Point', () => {
    //       const testPoint = new OlFeature({
    //         geometry: new OlGeomPoint(pointCoords)
    //       });
    //       const bufferedPoint = GeometryUtil.addBuffer(testPoint, 200, 'EPSG:4326') as OlFeature<OlGeomGeometry>;
    //       expect(bufferedPoint instanceof OlFeature).toBe(true);
    //       expect(bufferedPoint.getGeometry()!.getCoordinates()).toEqual(bufferedPointCoords);
    //     });
    //     it('adds a buffer to an ol.geom.Polygon', () => {
    //       const testPolygon = new OlFeature({
    //         geometry: new OlGeomPolygon(boxCoords)
    //       });
    //       const bufferedPolygon = GeometryUtil.addBuffer(testPolygon, 200, 'EPSG:4326');
    //       expect(bufferedPolygon instanceof OlFeature).toBe(true);
    //       expect(bufferedPolygon.getGeometry().getCoordinates()).toEqual(bufferedBoxCoords);
    //     });
    //     it('adds a buffer to an ol.geom.Linestring', () => {
    //       const testLineString = new OlFeature({
    //         geometry: new OlGeomLineString(lineStringCoords)
    //       });
    //       const bufferedLineString = GeometryUtil.addBuffer(testLineString, 200, 'EPSG:4326');
    //       expect(bufferedLineString instanceof OlFeature).toBe(true);
    //       expect(bufferedLineString.getGeometry().getCoordinates()).toEqual(bufferedLineStringCoords);
    //     });
    //     it('adds a buffer to an ol.geom.Polygon containing a hole', () => {
    //       const testPolygon = new OlFeature({
    //         geometry: new OlGeomPolygon(holeCoords)
    //       });
    //       const bufferedPolygon = GeometryUtil.addBuffer(testPolygon, 200, 'EPSG:4326');
    //       expect(bufferedPolygon instanceof OlFeature).toBe(true);
    //       expect(bufferedPolygon.getGeometry().getCoordinates()).toEqual(bufferedHoleCoords);
    //     });
    //   });
    //   describe('with ol.geom.Geometry as params', () => {
    //     it('adds a buffer to an ol.geom.Point', () => {
    //       const testPoint = new OlGeomPoint(pointCoords);
    //       const bufferedPoint = GeometryUtil.addBuffer(testPoint, 200, 'EPSG:4326');
    //       expect(bufferedPoint instanceof OlGeomPolygon).toBe(true);
    //       expect(bufferedPoint.getCoordinates()).toEqual(bufferedPointCoords);
    //     });
    //     it('adds a buffer to an ol.geom.Polygon', () => {
    //       const testPolygon = new OlGeomPolygon(boxCoords);
    //       const bufferedPolygon = GeometryUtil.addBuffer(testPolygon, 200, 'EPSG:4326');
    //       expect(bufferedPolygon instanceof OlGeomPolygon).toBe(true);
    //       expect(bufferedPolygon.getCoordinates()).toEqual(bufferedBoxCoords);
    //     });
    //     it('adds a buffer to an ol.geom.Linestring', () => {
    //       const testLineString = new OlGeomLineString(lineStringCoords);
    //       const bufferedLineString = GeometryUtil.addBuffer(testLineString, 200, 'EPSG:4326');
    //       expect(bufferedLineString instanceof OlGeomPolygon).toBe(true);
    //       expect(bufferedLineString.getCoordinates()).toEqual(bufferedLineStringCoords);
    //     });
    //   });
    // });

    describe('#separateGeometries', () => {
      it('can split a single ol.geom.MultiPoint into an array of ol.geom.Points', () => {
        const testPoint1 = new OlGeomPoint(pointCoords);
        const testPoint2 = new OlGeomPoint(pointCoords2);

        const mergedPoint = GeometryUtil.mergeGeometries([testPoint1, testPoint2]);
        const separatedPoints = GeometryUtil.separateGeometries(mergedPoint);
        expect(Array.isArray(separatedPoints)).toBe(true);
        expect(separatedPoints[0]).toBeInstanceOf(OlGeomPoint);
        const firstPoint = separatedPoints[0] as OlGeomPoint;
        const secondPoint = separatedPoints[1] as OlGeomPoint;
        expect(firstPoint.getCoordinates()).toEqual(pointCoords);
        expect(secondPoint.getCoordinates()).toEqual(pointCoords2);
      });
      it('can split a single ol.geom.MultiPolygoin into an array of ol.geom.Polygon', () => {
        const testPolygon1 = new OlGeomPolygon(boxCoords);
        const testPolygon2 = new OlGeomPolygon(boxCoords3);
        const mergedPolygon = GeometryUtil.mergeGeometries([testPolygon1, testPolygon2]);
        const separatedPolygons = GeometryUtil.separateGeometries(mergedPolygon);
        expect(Array.isArray(separatedPolygons)).toBe(true);
        expect(separatedPolygons[0]).toBeInstanceOf(OlGeomPolygon);
        const firstPolygon = separatedPolygons[0] as OlGeomPolygon;
        const secondPolygon = separatedPolygons[1] as OlGeomPolygon;
        expect(firstPolygon.getCoordinates()).toEqual(boxCoords);
        expect(secondPolygon.getCoordinates()).toEqual(boxCoords3);
      });
      it('can split a single ol.geom.MultiLineString into an array of ol.geom.LineString', () => {
        const testLineString1 = new OlGeomLineString(lineStringCoords);
        const testLineString2 = new OlGeomLineString(lineStringCoords2);
        const mergedLineString = GeometryUtil.mergeGeometries([testLineString1, testLineString2]);
        const separatedLineStrings = GeometryUtil.separateGeometries(mergedLineString);
        expect(Array.isArray(separatedLineStrings)).toBe(true);
        expect(separatedLineStrings[0]).toBeInstanceOf(OlGeomLineString);
        const firstLineString = separatedLineStrings[0] as OlGeomLineString;
        const secondLineString = separatedLineStrings[1] as OlGeomLineString;
        expect(firstLineString.getCoordinates()).toEqual(lineStringCoords);
        expect(secondLineString.getCoordinates()).toEqual(lineStringCoords2);
      });
      it('can split multiple mixed MultiGeometries into an array of ol.geom.Geomtries', () => {
        const testPoint1 = new OlGeomPoint(pointCoords);
        const testPoint2 = new OlGeomPoint(pointCoords2);
        const mergedPoint = GeometryUtil.mergeGeometries([testPoint1, testPoint2]);
        const testPolygon1 = new OlGeomPolygon(boxCoords);
        const testPolygon2 = new OlGeomPolygon(boxCoords3);
        const mergedPolygon = GeometryUtil.mergeGeometries([testPolygon1, testPolygon2]);
        const testLineString1 = new OlGeomLineString(lineStringCoords);
        const testLineString2 = new OlGeomLineString(lineStringCoords2);
        const mergedLineString = GeometryUtil.mergeGeometries([testLineString1, testLineString2]);
        const mixedMultiGeometries = [mergedPoint, mergedPolygon, mergedLineString];
        const separatedGeometries = GeometryUtil.separateGeometries(mixedMultiGeometries);
        expect(Array.isArray(separatedGeometries)).toBe(true);
        expect(separatedGeometries.length).toEqual(6);

        expect(separatedGeometries[0]).toBeInstanceOf(OlGeomPoint);
        expect(separatedGeometries[1]).toBeInstanceOf(OlGeomPoint);
        expect(separatedGeometries[2]).toBeInstanceOf(OlGeomPolygon);
        expect(separatedGeometries[3]).toBeInstanceOf(OlGeomPolygon);
        expect(separatedGeometries[4]).toBeInstanceOf(OlGeomLineString);
        expect(separatedGeometries[5]).toBeInstanceOf(OlGeomLineString);

        expect((separatedGeometries[0] as OlGeomPoint).getCoordinates()).toEqual(pointCoords);
        expect((separatedGeometries[1] as OlGeomPoint).getCoordinates()).toEqual(pointCoords2);
        expect((separatedGeometries[2] as OlGeomPolygon).getCoordinates()).toEqual(boxCoords);
        expect((separatedGeometries[3] as OlGeomPolygon).getCoordinates()).toEqual(boxCoords3);
        expect((separatedGeometries[4] as OlGeomLineString).getCoordinates()).toEqual(lineStringCoords);
        expect((separatedGeometries[5] as OlGeomLineString).getCoordinates()).toEqual(lineStringCoords2);
      });
      it('can split multiple mixed MultiGeometries and SingelGeometries into an array of ol.geom.Geomtries', () => {
        const testPoint1 = new OlGeomPoint(pointCoords);
        const testPoint2 = new OlGeomPoint(pointCoords2);
        const mergedPoint = GeometryUtil.mergeGeometries([testPoint1, testPoint2]);
        const testPolygon1 = new OlGeomPolygon(boxCoords);
        const testPolygon2 = new OlGeomPolygon(boxCoords3);
        const mixedMultiGeoemtries = [mergedPoint, testPolygon1, testPolygon2];
        const separatedGeometries = GeometryUtil.separateGeometries(mixedMultiGeoemtries);
        expect(Array.isArray(separatedGeometries)).toBe(true);
        expect(separatedGeometries.length).toEqual(4);
        expect(separatedGeometries[0]).toBeInstanceOf(OlGeomPoint);
        expect(separatedGeometries[1]).toBeInstanceOf(OlGeomPoint);
        expect(separatedGeometries[2]).toBeInstanceOf(OlGeomPolygon);
        expect(separatedGeometries[3]).toBeInstanceOf(OlGeomPolygon);
        expect((separatedGeometries[0] as OlGeomPoint).getCoordinates()).toEqual(pointCoords);
        expect((separatedGeometries[1] as OlGeomPoint).getCoordinates()).toEqual(pointCoords2);
        expect((separatedGeometries[2] as OlGeomPolygon).getCoordinates()).toEqual(boxCoords);
        expect((separatedGeometries[3] as OlGeomPolygon).getCoordinates()).toEqual(boxCoords3);
      });
    });

    describe('#mergeGeometries', () => {
      it('merges multiple instances of ol.geom.Point into ol.geom.MultiPoint', () => {
        const testPoint1 = new OlGeomPoint(pointCoords);
        const testPoint2 = new OlGeomPoint(pointCoords2);
        const mergedPoint = GeometryUtil.mergeGeometries([testPoint1, testPoint2]);
        expect(mergedPoint instanceof OlGeomMultiPoint).toBe(true);
        expect(mergedPoint.getCoordinates()).toEqual(mergedPointCoordinates);
      });
      it('merges multiple instances of ol.geom.Polygon into ol.geom.MultiPolygon', () => {
        const testPolygon1 = new OlGeomPolygon(boxCoords);
        const testPolygon2 = new OlGeomPolygon(boxCoords3);
        const mergedPolygon = GeometryUtil.mergeGeometries([testPolygon1, testPolygon2]);
        expect(mergedPolygon instanceof OlGeomMultiPolygon).toBe(true);
        expect(mergedPolygon.getCoordinates()).toEqual(mergedBoxCoords);
      });
      it('merges multiple instances of ol.geom.LineString into ol.geom.MultiLineString', () => {
        const testLineString1 = new OlGeomLineString(lineStringCoords);
        const testLineString2 = new OlGeomLineString(lineStringCoords2);
        const mergedLineString = GeometryUtil.mergeGeometries([testLineString1, testLineString2]);
        expect(mergedLineString instanceof OlGeomMultiLineString).toBe(true);
        expect(mergedLineString.getCoordinates()).toEqual(mergedLineStringCoordinates);
      });
      it('merges multiple instances of ol.geom.MultiPoint into ol.geom.MultiPoint', () => {
        const testMultiPoint1 = new OlGeomMultiPoint([pointCoords, pointCoords2]);
        const testMultiPoint2 = new OlGeomMultiPoint([pointCoords3, pointCoords4]);
        const mergedMultiPoint = GeometryUtil.mergeGeometries([testMultiPoint1, testMultiPoint2]);
        expect(mergedMultiPoint instanceof OlGeomMultiPoint).toBe(true);
        expect(mergedMultiPoint.getCoordinates()).toEqual(mergedPointCoordinates2);
      });
      it('merges multiple instances of ol.geom.MultiPolygon into ol.geom.MultiPolygon', () => {
        const testMultiPolygon1 = new OlGeomMultiPolygon([boxCoords, boxCoords2]);
        const testMultiPolygon2 = new OlGeomMultiPolygon([boxCoords3, boxCoords4]);
        const mergedMultiPolygon = GeometryUtil.mergeGeometries([testMultiPolygon1, testMultiPolygon2]);
        expect(mergedMultiPolygon instanceof OlGeomMultiPolygon).toBe(true);
        expect(mergedMultiPolygon.getCoordinates()).toEqual(expectedMultiPolygon);
      });
      it('merges multiple instances of ol.geom.MultiLineString into ol.geom.MultiLineString', () => {
        const testMultiLineString1 = new OlGeomMultiLineString([lineStringCoords]);
        const testMultiLineString2 = new OlGeomMultiLineString([lineStringCoords2]);
        const mergedMultiLineString = GeometryUtil.mergeGeometries([testMultiLineString1, testMultiLineString2]);
        expect(mergedMultiLineString instanceof OlGeomMultiLineString).toBe(true);
        expect(mergedMultiLineString.getCoordinates()).toEqual(mergedLineStringCoordinates);
      });
    });

    describe('#union', () => {
      describe('with ol.Feature as params', () => {
        it('unions multiple instances of ol.geom.Polygon into one ol.geom.MultiPolygon', () => {
          const poly1 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords)
          });
          const poly2 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords2)
          });
          const unionedFeature: OlFeature<OlGeomPolygon> =
            GeometryUtil.union([poly1, poly2], 'EPSG:4326') as OlFeature<OlGeomPolygon>;
          expect(unionedFeature).toBeDefined();
          expect(unionedFeature.getGeometry()).toBeDefined();
          expect(unionedFeature?.getGeometry()?.getCoordinates()).toEqual(unionedBoxCoordinates);
        });

        it('unions multiple instances of ol.geom.MultiPolygon into one ol.geom.MultiPolygon', () => {
          const multiPoly1 = new OlFeature({
            geometry: new OlGeomMultiPolygon([boxCoords])
          });
          const multiPoly2 = new OlFeature({
            geometry: new OlGeomMultiPolygon([boxCoords2])
          });
          const unionedFeature = GeometryUtil.union([multiPoly1, multiPoly2], 'EPSG:4326');
          expect(unionedFeature instanceof OlFeature).toBe(true);
          expect((unionedFeature as OlFeature<OlGeomMultiPolygon>)!.getGeometry()!
            .getCoordinates()).toEqual(unionedBoxCoordinates);
        });
      });
      describe('with ol.geom.Geometry as params', () => {
        it('unions multiple instances of ol.geom.Polygon into one ol.geom.MultiPolygon', () => {
          const poly1 = new OlGeomPolygon(boxCoords);
          const poly2 = new OlGeomPolygon(boxCoords2);
          const unionedGeometry = GeometryUtil.union([poly1, poly2], 'EPSG:4326');
          expect(unionedGeometry).toBeInstanceOf(OlGeomPolygon);
          expect((unionedGeometry as OlGeomPolygon).getCoordinates()).toEqual(unionedBoxCoordinates);
        });
      });
    });

    describe('#difference', () => {
      describe('with ol.Feature as params', () => {
        it('returns the difference of two instances of ol.geom.Polygon', () => {
          const poly1 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords)
          });
          const poly2 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords2)
          });
          const differenceFeature = GeometryUtil.difference(poly1, poly2, 'EPSG:4326');
          expect(differenceFeature instanceof OlFeature).toBe(true);
          expect((differenceFeature as OlFeature<OlGeomPolygon | OlGeomMultiPolygon>)!.getGeometry()!.getCoordinates())
            .toEqual(differenceBoxCoords);
        });
        it('returns poly1 if no difference is found', () => {
          const poly1 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords)
          });
          const poly2 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords4)
          });
          const differenceFeature = GeometryUtil.difference(poly1, poly2, 'EPSG:4326');
          expect(differenceFeature instanceof OlFeature).toBe(true);
          expect((differenceFeature as OlFeature<OlGeomPolygon | OlGeomMultiPolygon>)!.getGeometry()!.getCoordinates())
            .toEqual(poly1?.getGeometry()?.getCoordinates());
        });
      });
      describe('with ol.geom.Geometry as params', () => {
        it('returns the difference of two instances of ol.geom.Polygon', () => {
          const poly1 = new OlGeomPolygon(boxCoords);
          const poly2 = new OlGeomPolygon(boxCoords2);
          const differenceGeometry = GeometryUtil.difference(poly1, poly2, 'EPSG:4326');
          expect(differenceGeometry instanceof OlGeometry).toBe(true);
          expect((differenceGeometry as OlGeomMultiPolygon).getCoordinates()).toEqual(differenceBoxCoords);
        });
        it('returns poly1 if no difference is found', () => {
          const poly1 = new OlGeomPolygon(boxCoords);
          const poly2 = new OlGeomPolygon(boxCoords4);
          const differenceGeometry = GeometryUtil.difference(poly1, poly2, 'EPSG:4326');
          expect(differenceGeometry instanceof OlGeometry).toBe(true);
          expect((differenceGeometry as OlGeomPolygon).getCoordinates()).toEqual(poly1.getCoordinates());
        });
      });
    });

    describe('#intersection', () => {
      describe('with ol.Feature as params', () => {
        it('returns the intersection of two instances of ol.geom.Polygon', () => {
          const poly1 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords)
          });
          const poly2 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords3)
          });
          const intersectionFeature = GeometryUtil.intersection(poly1, poly2, 'EPSG:4326');
          expect(intersectionFeature instanceof OlFeature).toBe(true);
          expect((intersectionFeature as OlFeature<OlGeomPolygon>)!.getGeometry()!.getCoordinates())
            .toEqual(intersectionCoords);
        });
        it('returns null if no intersection is found', () => {
          const poly1 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords)
          });
          const poly2 = new OlFeature({
            geometry: new OlGeomPolygon(boxCoords4)
          });
          const intersectionFeature = GeometryUtil.intersection(poly1, poly2, 'EPSG:4326');
          expect(intersectionFeature).toBeUndefined();
        });
      });
      describe('with ol.geom.Geometry as params', () => {
        it('returns the intersection of two instances of ol.geom.Polygon', () => {
          const poly1 = new OlGeomPolygon(boxCoords);
          const poly2 = new OlGeomPolygon(boxCoords3);
          const intersectionGeometry = GeometryUtil.intersection(poly1, poly2, 'EPSG:4326');
          expect(intersectionGeometry).toBeInstanceOf(OlGeomPolygon);
          expect((intersectionGeometry as OlGeomPolygon).getCoordinates()).toEqual(intersectionCoords);
        });
        it('returns null if no intersection is found', () => {
          const poly1 = new OlGeomPolygon(boxCoords);
          const poly2 = new OlGeomPolygon(boxCoords4);
          const intersectionGeometry = GeometryUtil.intersection(poly1, poly2, 'EPSG:4326');
          expect(intersectionGeometry).toBeUndefined();
        });
      });
    });
  });
});
