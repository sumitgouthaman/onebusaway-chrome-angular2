import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Region, Stop, ArrivalDeparture } from './oba';
import * as regionsData from './regions-v3.json';

import * as urlJoin from 'url-join';
import * as moment from 'moment';

@Injectable()
export class ObaService {

  private allRegionsPromise: Promise<Array<Region>>;
  private defaultRegionPromise: Promise<Region>;

  private static getJitteredDelay(delay: number, jitter: number): number {
    const appliedJitter = Math.floor(Math.random() * (jitter * 2 + 1)) - jitter;
    return delay - appliedJitter;
  }

  private static retryPromiseInner<T>(requestId: string, promiseLambda: () => Promise<T>,
    resolve: (T) => void, reject: (any) => void,
    maxRetries: number = 3, initialDelay: number, maxDelay: number, attemptNum: number = 0) {

    console.log(`Attempt ${attemptNum}/${maxRetries} of request ${requestId}`);
    if (attemptNum > maxRetries) {
      reject(`Request ${requestId} failed after ${attemptNum} attempts.`);
    }

    let delay = attemptNum === 0 ? 0 : initialDelay * Math.pow(2, attemptNum - 1);
    delay = Math.min(delay, maxDelay);
    delay = ObaService.getJitteredDelay(delay, 25);
    delay = Math.max(0, delay);
    console.log(`Attempt ${attemptNum}/${maxRetries} of request ${requestId} will use delay: ${delay}`);

    setTimeout(() => {
      promiseLambda().then((result: T) => {
        resolve(result);
      }).catch(error => {
        ObaService.retryPromiseInner(
          requestId, promiseLambda, resolve, reject,
          maxRetries, initialDelay, maxDelay, attemptNum + 1);
      });
    }, delay);
  }

  private static retryPromise<T>(requestId: string, promiseLambda: () => Promise<T>,
    maxRetries: number = 3, initialDelay: number = 200, maxDelay: number = 2000):
    Promise<T> {
    return new Promise<T>((resolve, reject) => {
      ObaService.retryPromiseInner(requestId, promiseLambda,
        resolve, reject,
        maxRetries, initialDelay, maxDelay, 0);
    });
  }

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
    return ObaService.retryPromise('getNearbyStops', () => {
      return new Promise<Array<Stop>>((resolve, reject) => {
        this.http.get(
          urlJoin(region.obaBaseUrl, '/api/where/stops-for-location.json'),
          {
            params: new HttpParams()
            .set('key', environment.obaApiKey)
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
    });
  }

  getSpecificStop(region: Region, coords: Coordinates, stopNumber: number): Promise<Stop> {
    return ObaService.retryPromise('getSpecificStop', () => {
      return new Promise<Stop>((resolve, reject) => {
        this.http.get(
          urlJoin(region.obaBaseUrl, '/api/where/stops-for-location.json'),
          {
            params: new HttpParams()
            .set('key', environment.obaApiKey)
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
    });
  }

  getArrivalDepartures(stop: Stop): Promise<Array<ArrivalDeparture>> {
    return ObaService.retryPromise('getArrivalDepartures', () => {
      return new Promise<Array<ArrivalDeparture>>((resolve, reject) => {
        this.http.get(
          urlJoin(stop.region.obaBaseUrl, `/api/where/arrivals-and-departures-for-stop/${stop.id}.json`),
          {
            params: new HttpParams()
            .set('key', environment.obaApiKey)
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
    });
  }
}
