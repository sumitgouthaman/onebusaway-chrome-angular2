import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as sinon from 'sinon';
import { ObaService, Region, Stop } from './oba.service';
import { GeoService } from '../geo/geo.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

describe('ObaService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const geoServiceStub = {
      getLocation() {
        return new Promise<Coordinates>(resolve => {
          const coords: Coordinates = {
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            latitude: 47.613824,
            longitude: -122.201277,
            speed: null,
          };
          resolve(coords);
        });
      }
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ObaService,
        {
          provide: GeoService,
          useValue: geoServiceStub
        },
      ]
    });
    httpMock = TestBed.get(HttpTestingController);
    this.clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    this.clock.restore();
  });

  it('should be created', inject([ObaService], (service: ObaService) => {
    expect(service).toBeTruthy();
  }));

  it('should filter experimental regions', done => inject([ObaService], (service: ObaService) => {
    service.getRegions().then(allRegions => {
      expect(allRegions.some(r => r.experimental)).toBeFalsy();
      done();
    });
  })());

  it('should not filter experimental regions if asked', done => inject([ObaService], (service: ObaService) => {
    service.getRegions(true).then(allRegions => {
      expect(allRegions.some(r => r.experimental)).toBeTruthy();
      done();
    });
  })());

  it('should return correct region based on location (Puget Sound)', done => inject([ObaService], (service: ObaService) => {
    service.getDefaultRegion().then(region => {
      expect(region.regionName).toBe('Puget Sound');
      done();
    });
  })());

  it('should return correct region based on location (New York)', done => {
    const geoServiceStub = {
      locationPromise: new Promise<Coordinates>(resolve => {
        const coords: Coordinates = {
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 40.721722,
          longitude: -73.999856,
          speed: null,
        };
        resolve(coords);
      }),
      getLocation() {
        return this.locationPromise;
      }
    };
    const obaService = new ObaService(TestBed.get(HttpClient), geoServiceStub);
    obaService.getDefaultRegion().then(region => {
      expect(region.regionName).toBe('MTA New York');
      done();
    });
  });

  it('should return correct region when experimental enabled', done => {
    const geoServiceStub = {
      locationPromise: new Promise<Coordinates>(resolve => {
        const coords: Coordinates = {
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 37.8917275,
          longitude: -122.28957750000001,
          speed: null,
        };
        resolve(coords);
      }),
      getLocation() {
        return this.locationPromise;
      }
    };
    const obaService = new ObaService(TestBed.get(HttpClient), geoServiceStub);
    obaService.getDefaultRegion(true).then(region => {
      expect(region.regionName).toBe('Bear Transit (beta)');
      done();
    });
  });

  it('should throw when coords in experimental regions but experimental disabled', done => {
    const geoServiceStub = {
      locationPromise: new Promise<Coordinates>(resolve => {
        const coords: Coordinates = {
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 37.8917275,
          longitude: -122.28957750000001,
          speed: null,
        };
        resolve(coords);
      }),
      getLocation() {
        return this.locationPromise;
      }
    };
    const obaService = new ObaService(TestBed.get(HttpClient), geoServiceStub);
    obaService.getDefaultRegion().then().catch(error => {
      done();
    });
  });

  it('should throw if coords not in any region', done => {
    const geoServiceStub = {
      locationPromise: new Promise<Coordinates>(resolve => {
        const coords: Coordinates = {
          accuracy: 1,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          latitude: 35.214302,
          longitude: -59.350709,
          speed: null,
        };
        resolve(coords);
      }),
      getLocation() {
        return this.locationPromise;
      }
    };
    const obaService = new ObaService(TestBed.get(HttpClient), geoServiceStub);
    obaService.getDefaultRegion().then().catch(error => {
      done();
    });
  });

  it('should return correct values for getNearbyStops', done => {
    inject([ObaService], (service: ObaService) => {
      const region: Region = {
        bounds: null,
        experimental: false,
        obaBaseUrl: 'http://myregion/oba',
        regionName: 'My region'
      };
      const coords: Coordinates = {
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 100,
        longitude: 200,
        speed: null,
      };
      service.getNearbyStops(region, coords).then(stops => {
        expect(stops.length).toBe(2);

        const stop1 = stops[0];
        expect(stop1.code).toBe('code1');
        expect(stop1.direction).toBe('N');
        expect(stop1.formattedDirection).toBe('North bound');
        expect(stop1.id).toBe('id1');
        expect(stop1.name).toBe('stop1');
        expect(stop1.region).toEqual(region);

        const stop2 = stops[1];
        expect(stop2.code).toBe('code2');
        expect(stop2.direction).toBe('S');
        expect(stop2.formattedDirection).toBe('South bound');
        expect(stop2.id).toBe('id2');
        expect(stop2.name).toBe('stop2');
        expect(stop2.region).toEqual(region);

        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === 'http://myregion/oba/api/where/stops-for-location.json'
            && request.params.get('key') === 'YOUR_DEV_API_KEY_HERE'
            && request.params.get('lat') === coords.latitude.toString()
            && request.params.get('lon') === coords.longitude.toString()
            && request.method === 'GET';
      });
      req.flush({
        'code': 200,
        'data': {
          'limitExceeded': false,
          'list': [
            {
              'code': 'code1',
              'direction': 'N',
              'id': 'id1',
              'lat': 1,
              'locationType': 0,
              'lon': 2,
              'name': 'stop1'
            },
            {
              'code': 'code2',
              'direction': 'S',
              'id': 'id2',
              'lat': 3,
              'locationType': 0,
              'lon': 4,
              'name': 'stop2'
            }
          ]
        },
        'text': 'OK',
        'version': 2
      });
      httpMock.verify();
    })();
  });

  it('should return correct values for getSpecificStop', done => {
    inject([ObaService], (service: ObaService) => {
      const region: Region = {
        bounds: null,
        experimental: false,
        obaBaseUrl: 'http://myregion/oba',
        regionName: 'My region'
      };
      const coords: Coordinates = {
        accuracy: 0,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 100,
        longitude: 200,
        speed: null,
      };
      service.getSpecificStop(region, coords, 1234).then(stop => {
        expect(stop.code).toBe('1234');
        expect(stop.direction).toBe('N');
        expect(stop.formattedDirection).toBe('North bound');
        expect(stop.id).toBe('1_1234');
        expect(stop.name).toBe('stop1');
        expect(stop.region).toEqual(region);

        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === 'http://myregion/oba/api/where/stops-for-location.json'
            && request.params.get('key') === 'YOUR_DEV_API_KEY_HERE'
            && request.params.get('lat') === coords.latitude.toString()
            && request.params.get('lon') === coords.longitude.toString()
            && request.params.get('query') === '1234'
            && request.method === 'GET';
      });
      req.flush({
        'code': 200,
        'data': {
          'limitExceeded': false,
          'list': [
            {
              'code': '1234',
              'direction': 'N',
              'id': '1_1234',
              'lat': 1,
              'locationType': 0,
              'lon': 2,
              'name': 'stop1'
            }
          ]
        },
        'text': 'OK',
        'version': 2
      });
      httpMock.verify();
    })();
  });

  it('should return correct values for getArrivalDepartures', done => {
    this.clock.tick(1507401295000);
    inject([ObaService], (service: ObaService) => {
      const region: Region = {
        bounds: null,
        experimental: false,
        obaBaseUrl: 'http://myregion/oba',
        regionName: 'My region'
      };
      const stop: Stop = {
        code: 'code1',
        direction: 'N',
        formattedDirection: 'North bound',
        id: '1_code1',
        name: 'Fictional',
        region: region
      };
      service.getArrivalDepartures(stop).then(arrivalDepartures => {
        expect(arrivalDepartures.length).toBe(2);

        const arrival1 = arrivalDepartures[0];
        expect(arrival1.routeLongName).toBe('Bellevue - Seattle');
        expect(arrival1.routeShortName).toBe('550E');
        expect(arrival1.tripHeadsign).toBe('Seattle');
        expect(arrival1.predictedArrivalTime).toBe(1507401415000);
        expect(arrival1.relativePredictedArrivalTime).toBe('in 2 minutes');
        expect(arrival1.scheduledArrivalTime).toBe(1507401476000);
        expect(arrival1.relativeScheduledArrivalTime).toBe('in 3 minutes');

        const arrival2 = arrivalDepartures[1];
        expect(arrival2.routeLongName).toBe('');
        expect(arrival2.routeShortName).toBe('249');
        expect(arrival2.tripHeadsign).toBe('S Bellevue');
        expect(arrival2.predictedArrivalTime).toBe(0);
        expect(arrival2.relativePredictedArrivalTime).toBe('--');
        expect(arrival2.scheduledArrivalTime).toBe(1507402178000);
        expect(arrival2.relativeScheduledArrivalTime).toBe('in 15 minutes');

        done();
      });

      const req = httpMock.expectOne(request => {
        return request.url === 'http://myregion/oba/api/where/arrivals-and-departures-for-stop/1_code1.json'
            && request.params.get('key') === 'YOUR_DEV_API_KEY_HERE'
            && request.method === 'GET';
      });
      req.flush({
        'code': 200,
        'data': {
          'entry': {
            'arrivalsAndDepartures': [
              {
                'predictedArrivalTime': 1507401415000,
                'routeLongName': 'Bellevue - Seattle',
                'routeShortName': '550E',
                'scheduledArrivalTime': 1507401476000,
                'tripHeadsign': 'Seattle',
              },
              {
                'predictedArrivalTime': 0,
                'routeLongName': '',
                'routeShortName': '249',
                'scheduledArrivalTime': 1507402178000,
                'tripHeadsign': 'S Bellevue',
              },
            ]
          }
        },
        'text': 'OK',
        'version': 2
      });
      httpMock.verify();
    })();
  });
});
