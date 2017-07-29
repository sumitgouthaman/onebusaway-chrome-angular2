import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as regionsData from './regions-v3.json';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class ObaRegionsModule {
  static getRegions() {
    return (<any>regionsData).data.list;
  }

  static getDefaultRegion(regions: any) {
    const pugetSound =  regions.filter(r => r.regionName === 'Puget Sound');
    if (pugetSound.length > 0) {
      return pugetSound[0];
    }
    return regions[0];
  }
}
