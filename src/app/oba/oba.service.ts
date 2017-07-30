import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Region, Stop } from './oba';
import * as regionsData from './regions-v3.json';

import * as urlJoin from 'url-join';

@Injectable()
export class ObaService {

  private allRegionsPromise: Promise<Array<Region>>;
  private defaultRegion: Promise<Region>;
  private key = 'YOUR_API_KEY_HERE';

  static formatDirection(direction: string): string {
    return direction
      .replace('N', 'North')
      .replace('S', 'South')
      .replace('W', 'West')
      .replace('E', 'East');
  }

  constructor(private http: HttpClient) {
    this.allRegionsPromise = new Promise<Array<Region>>(resolve => {
      resolve((<any>regionsData).data.list);
    });

    this.defaultRegion = new Promise<Region>(resolve => {
      this.allRegionsPromise.then(regions => {
        const pugetSound = regions.filter(r => r.regionName === 'Puget Sound');
        if (pugetSound.length > 0) {
          resolve(pugetSound[0]);
        }
        resolve(regions.length ? regions[0] : null);
      });
    });
  }

  getRegions(): Promise<Array<Region>> {
    return this.allRegionsPromise;
  }

  getDefaultRegion(): Promise<Region> {
    return this.defaultRegion;
  }

  getNearbyStops(region: Region, coords: Coordinates): Promise<Array<Stop>> {
    return new Promise<Array<Stop>>((resolve, reject) => {
      this.http.get(
        urlJoin(region.obaBaseUrl, '/api/where/stops-for-location.json'),
        {
          params: new HttpParams()
          .set('key', this.key)
          .set('lat', coords.latitude.toString())
          .set('lon', coords.longitude.toString())
        }
      ).subscribe((result: any) => {
        const stops: Array<Stop> = result.data.list.map(s => {
          s['formattedDirection'] = ObaService.formatDirection(s.direction);
          return s;
        });
        resolve(stops);
      }, error => {
        reject(error);
      });
    });
  }
}
