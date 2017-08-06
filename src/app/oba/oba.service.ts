import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Region, Stop, ArrivalDeparture } from './oba';
import * as regionsData from './regions-v3.json';

import * as urlJoin from 'url-join';
import * as moment from 'moment';

@Injectable()
export class ObaService {

  private allRegionsPromise: Promise<Array<Region>>;
  private defaultRegionPromise: Promise<Region>;
  private key = 'YOUR_API_KEY_HERE';

  private static formatDirection(direction: string): string {
    return direction
      .replace('N', 'North')
      .replace('S', 'South')
      .replace('W', 'West')
      .replace('E', 'East') + ' bound';
  }

  private static getTimeMinsLeft(unixTime) {
    if (!unixTime) {
      return '--';
    }
    const day = moment(unixTime);
    return day.fromNow();
  }

  private static enhanceStopData(stop: Stop, region: Region) {
    stop.formattedDirection = ObaService.formatDirection(stop.direction);
    stop.region = region;
    return stop;
  }

  constructor(private http: HttpClient) {
    this.allRegionsPromise = new Promise<Array<Region>>(resolve => {
      resolve((<any>regionsData).data.list);
    });

    this.defaultRegionPromise = new Promise<Region>(resolve => {
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
    return this.defaultRegionPromise;
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
        const stops: Array<Stop> = result.data.list.map(
          s => ObaService.enhanceStopData(s, region));
        resolve(stops);
      }, error => {
        reject(error);
      });
    });
  }

  getSpecificStop(region: Region, coords: Coordinates, stopNumber: number): Promise<Stop> {
    return new Promise<Stop>((resolve, reject) => {
      this.http.get(
        urlJoin(region.obaBaseUrl, '/api/where/stops-for-location.json'),
        {
          params: new HttpParams()
          .set('key', this.key)
          .set('lat', coords.latitude.toString())
          .set('lon', coords.longitude.toString())
          .set('query', stopNumber.toString())
        }
      ).subscribe((result: any) => {
        if (!result.data.list.length) {
          reject('Stop not found.');
        }
        const stops: Array<Stop> = result.data.list.map(
          s => ObaService.enhanceStopData(s, region));
        const stop: Stop = stops[0];
        resolve(stop);
      }, error => {
        reject('Error fetching stop.');
      });
    });
  }

  getArrivalDepartures(stop: Stop): Promise<Array<ArrivalDeparture>> {
    return new Promise<Array<ArrivalDeparture>>((resolve, reject) => {
      this.http.get(
        urlJoin(stop.region.obaBaseUrl, `/api/where/arrivals-and-departures-for-stop/${stop.id}.json`),
        {
          params: new HttpParams()
          .set('key', this.key)
        }
      ).subscribe((result: any) => {
        const arrivalDepartures: Array<ArrivalDeparture> = result.data.entry.arrivalsAndDepartures.map((ad: ArrivalDeparture) => {
          ad.relativeScheduledArrivalTime = ObaService.getTimeMinsLeft(ad.scheduledArrivalTime);
          ad.relativePredictedArrivalTime = ObaService.getTimeMinsLeft(ad.predictedArrivalTime);
          return ad;
        });
        resolve(arrivalDepartures);
      }, error => {
        reject(error);
      });
    });
  }
}
