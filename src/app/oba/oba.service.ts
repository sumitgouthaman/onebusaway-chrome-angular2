import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';

import * as regionsData from './regions-v3.json';

import * as urlJoin from 'url-join';
import * as moment from 'moment';
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

  private allRegionsPromiseWithExperimental: Promise<Array<Region>>;
  private allRegionsPromise: Promise<Array<Region>>;
  private defaultRegionPromiseWithExperimental: Promise<Region>;
  private defaultRegionPromise: Promise<Region>;

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

  private static getDefaultRegionFromRegionsPromise(regionsPromise: Promise<Array<Region>>, geoService: GeoService) {
    return new Promise<Region>((resolve, reject) => {
      regionsPromise.then(regions => {
        if (!regions) {
          reject('No regions available.');
          return;
        }
        geoService.getLocation().then(coords => {
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

  private static retryExponential (errors) {
    return Observable.zip(
      Observable.range(1, 3), errors, function (i, e) { return i; })
      .flatMap(function (i) {
        const delay = i * 500;
        console.log(`Delay retry by ${delay} millis.`);
        return Observable.timer(delay);
    });
  }

  constructor(private http: HttpClient, private geoService: GeoService) {
    this.allRegionsPromiseWithExperimental = new Promise<Array<Region>>(resolve => {
      resolve((<any>regionsData).data.list);
    });

    this.allRegionsPromise = new Promise<Array<Region>>((resolve, reject) => {
      this.allRegionsPromiseWithExperimental.then(allRegions => {
        const filteredRegions = allRegions.filter(r => !r.experimental);
        console.log(`Using ${filteredRegions.length}/${allRegions.length} regions after removing experimental.`);
        resolve(filteredRegions);
      }).catch(error => {
        reject(error);
      });
    });

    this.defaultRegionPromiseWithExperimental = ObaService.getDefaultRegionFromRegionsPromise(
      this.allRegionsPromiseWithExperimental, this.geoService);

    this.defaultRegionPromise = ObaService.getDefaultRegionFromRegionsPromise(
      this.allRegionsPromise, this.geoService);
  }

  getRegions(returnExperimentalRegions = false): Promise<Array<Region>> {
    return returnExperimentalRegions ? this.allRegionsPromiseWithExperimental : this.allRegionsPromise;
  }

  getDefaultRegion(returnExperimentalRegions = false): Promise<Region> {
    return returnExperimentalRegions ? this.defaultRegionPromiseWithExperimental : this.defaultRegionPromise;
  }

  getNearbyStops(region: Region, coords: Coordinates): Promise<Array<Stop>> {
    return new Promise<Array<Stop>>((resolve, reject) => {
      this.http.get(
        urlJoin(region.obaBaseUrl, '/api/where/stops-for-location.json'),
        {
          params: new HttpParams()
          .set('key', environment.obaApiKey)
          .set('lat', coords.latitude.toString())
          .set('lon', coords.longitude.toString())
        }
      ).retryWhen(ObaService.retryExponential)
      .subscribe((result: any) => {
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
          .set('key', environment.obaApiKey)
          .set('lat', coords.latitude.toString())
          .set('lon', coords.longitude.toString())
          .set('query', stopNumber.toString())
        }
      ).retryWhen(ObaService.retryExponential)
      .subscribe((result: any) => {
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
          .set('key', environment.obaApiKey)
        }
      ).retryWhen(ObaService.retryExponential)
      .subscribe((result: any) => {
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
