import { Injectable } from '@angular/core';

import { Region } from './region';
import * as regionsData from './regions-v3.json';

@Injectable()
export class ObaService {

  private allRegionsPromise: Promise<Array<Region>>;
  private defaultRegion: Promise<Region>;

  constructor() {
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
}
