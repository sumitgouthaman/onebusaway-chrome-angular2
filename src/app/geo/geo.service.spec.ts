import { TestBed, inject } from '@angular/core/testing';

import { GeoService } from './geo.service';

describe('GeoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeoService]
    });
  });

  it('should be created', (done) => {
    const geoLocationStub = {
      getCurrentPosition(resolve, reject) {
        resolve({
          coords: {
            latitude: 123,
            longitude: 234
          }
        });
      }
    };
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(geoLocationStub);
    inject([GeoService], (service: GeoService) => {
      expect(service).toBeTruthy();
      service.getLocation().then(coords => {
        expect(coords.latitude).toBe(123);
        expect(coords.longitude).toBe(234);
        done();
      });
    })();
  });

  it('should reject when geolocation not available', (done) => {
    spyOnProperty(navigator, 'geolocation', 'get').and.returnValue(null);
    inject([GeoService], (service: GeoService) => {
      expect(service).toBeTruthy();
      service.getLocation().then().catch(error => {
        done();
      });
    })();
  });
});
