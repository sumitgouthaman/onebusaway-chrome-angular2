import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

import * as regionsData from './regions-v3.json';

import * as urlJoin from 'url-join';
import * as moment from 'moment';
import { RetryPromise } from 'promise-exponential-retry';
import { GeoService } from '../geo/geo.service';

interface Bound {
  lat: number;
  latSpan: number;
  lon: number;
  lonSpan: number;
}

export interface Region {
  obaBaseUrl: string;
  regionName: string;
  bounds: Array<Bound>;
  experimental: boolean;
}

export class Stop {
  code: string;
  direction: string;
  formattedDirection: string;
  id: string;
  name: string;
  region: Region;
}

export class ArrivalDeparture {
  routeLongName: string;
  routeShortName: string;
  scheduledArrivalTime: number;
  relativeScheduledArrivalTime: string;
  predictedArrivalTime: number;
  relativePredictedArrivalTime: string;
  tripHeadsign: string;
}

@Injectable()
export class ObaService {

  private allRegionsPromise: Promise<Array<Region>>;
  private filteredRegionsPromise: Promise<Array<Region>>;
  private defaultRegionPromise: Promise<Region>;
  private useExperimentalRegions = false;

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

  private static coordsInBound(bound: Bound, coords: Coordinates) {
    const halfLatSpan = bound.latSpan / 2.0;
    const halfLonSpan = bound.lonSpan / 2.0;
    const latMin = bound.lat - halfLatSpan;
    const latMax = bound.lat + halfLatSpan;
    const lonMin = bound.lon - halfLonSpan;
    const lonMax = bound.lon + halfLonSpan;
    return (
      coords.latitude >= latMin
      && coords.latitude <= latMax
      && coords.longitude >= lonMin
      && coords.longitude <= lonMax
    );
  }

  private static coordsInRegion(region: Region, coords: Coordinates) {
    return region.bounds.some(bound => ObaService.coordsInBound(bound, coords));
  }

  constructor(private http: HttpClient, private geoService: GeoService) {
    this.allRegionsPromise = new Promise<Array<Region>>(resolve => {
      resolve((<any>regionsData).data.list);
    });

    this.filteredRegionsPromise = new Promise<Array<Region>>((resolve, reject) => {
      this.allRegionsPromise.then(allRegions => {
        const filteredRegions = allRegions.filter(r => {
          if (this.useExperimentalRegions) {
            return true;
          } else {
            return !r.experimental;
          }
        });
        console.log(`Using ${filteredRegions.length}/${allRegions.length} regions after filtering.`);
        resolve(filteredRegions);
      }).catch(error => {
        reject(error);
      });
    });

    this.defaultRegionPromise = new Promise<Region>((resolve, reject) => {
      this.filteredRegionsPromise.then(regions => {
        if (!regions) {
          reject('No regions available.');
          return;
        }
        this.geoService.getLocation().then(coords => {
          const regionsInBounds = regions.filter(r => ObaService.coordsInRegion(r, coords));
          if (regionsInBounds.length < 1) {
            reject('No region\'s bounds match the current coordinates.');
            return;
          }
          if (regionsInBounds.length > 1) {
            const regionNames = regionsInBounds.map(r => r.regionName);
            console.log(`Multiple regions matched to location. Will return first one. Regions: ${regionNames}`);
          }
          resolve(regionsInBounds[0]);
        }).catch(error => {
          reject('Error determining regions. Couldn\'t get location');
        });
      });
    });
  }

  getRegions(returnExperimentalRegions = false): Promise<Array<Region>> {
    return this.filteredRegionsPromise;
  }

  getDefaultRegion(): Promise<Region> {
    return this.defaultRegionPromise;
  }

  getNearbyStops(region: Region, coords: Coordinates): Promise<Array<Stop>> {
    return RetryPromise.retryPromise('getNearbyStops', () => {
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
    return RetryPromise.retryPromise('getSpecificStop', () => {
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
    return RetryPromise.retryPromise('getArrivalDepartures', () => {
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
