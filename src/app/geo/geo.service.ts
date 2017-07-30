import { Injectable } from '@angular/core';

@Injectable()
export class GeoService {

  locationPromise: Promise<Coordinates>;

  constructor() {
    this.locationPromise = new Promise<Coordinates>((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          resolve(position.coords);
        }, error => {
          reject(error.message);
        });
      } else {
        reject('Location not available.');
      }
    });
  }

  getLocation(): Promise<Coordinates> {
    return this.locationPromise;
  }
}
