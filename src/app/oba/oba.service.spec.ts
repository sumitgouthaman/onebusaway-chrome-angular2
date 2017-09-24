import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ObaService } from './oba.service';
import { GeoService } from '../geo/geo.service';

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
            latitude: 101,
            longitude: 102,
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
  });

  it('should be created', inject([ObaService], (service: ObaService) => {
    expect(service).toBeTruthy();
  }));
});
