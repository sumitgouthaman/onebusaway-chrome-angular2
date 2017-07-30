import { Component } from '@angular/core';
import { ObaService } from './oba/oba.service';
import { Region } from './oba/oba';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private obaService: ObaService;
  regions: Array<Region>;
  selectedRegion: Region;

  addStopsMode = false;

  constructor (obaService: ObaService) {
    this.obaService = obaService;
    this.obaService.getRegions().then(regions => {
      this.regions = regions;
    });
    this.obaService.getDefaultRegion().then(region => {
      this.selectedRegion = region;
    });
  }

  toggleAddStopsMode() {
    this.addStopsMode = !this.addStopsMode;
  }
}
