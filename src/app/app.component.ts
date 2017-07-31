import { Component, OnInit } from '@angular/core';
import { ObaService } from './oba/oba.service';
import { Region, Stop } from './oba/oba';
import { StorageService } from './storage/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  regions: Array<Region>;
  selectedRegion: Region;
  savedStops: Array<Stop>;

  addStopsMode = false;

  constructor (
    private obaService: ObaService,
    private storageService: StorageService) {
    this.obaService = obaService;
    this.obaService.getRegions().then(regions => {
      this.regions = regions;
    });
    this.obaService.getDefaultRegion().then(region => {
      this.selectedRegion = region;
    });
  }

  ngOnInit(): void {
    this.updateSavedStops();
  }

  toggleAddStopsMode() {
    this.addStopsMode = !this.addStopsMode;
  }

  updateSavedStops() {
    this.storageService.getAllStops().then(stops => {
      this.savedStops = stops;
    });
  }
}
