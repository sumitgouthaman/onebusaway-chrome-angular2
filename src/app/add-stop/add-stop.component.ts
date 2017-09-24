import {
  Component,
  OnInit,
  SimpleChanges,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { MdSnackBar } from '@angular/material';

import { Region, Stop, ObaService } from '../oba/oba.service';
import { GeoService } from '../geo/geo.service';
import { StorageService } from '../storage/storage.service';

@Component({
  selector: 'app-add-stop',
  templateUrl: './add-stop.component.html',
  styleUrls: ['./add-stop.component.css']
})
export class AddStopComponent implements OnInit {

  @Output() addStopsDone: EventEmitter<number> = new EventEmitter<number>();

  coordsPromise: Promise<Coordinates>;
  nearbyStops: Array<Stop>;
  selectedRegion: Region;
  allRegions: Array<Region>;
  stopNumber: number;

  constructor(
    private geoService: GeoService,
    private obaService: ObaService,
    private storageService: StorageService,
    private snackBar: MdSnackBar) {
    this.coordsPromise = this.geoService.getLocation();
    this.obaService.getRegions().then(regions => {
      this.allRegions = regions;
      this.obaService.getDefaultRegion().then(region => {
        this.selectedRegion = region;
        this.loadNearbyStops();
      });
    });
  }

  ngOnInit() { }

  private loadNearbyStops() {
    this.nearbyStops = null;
    this.coordsPromise.then(coords => {
      this.obaService.getNearbyStops(this.selectedRegion, coords).then(stops => {
        this.nearbyStops = stops;
      });
    });
  }

  addStop(stop: Stop) {
    this.storageService.addStop(stop).then(result => {
      this.toast(`Stop# ${stop.code} saved.`);
    }).catch(error => {
      this.toast(`Error: ${error}`);
    });
  }

  addSpecificStops() {
    console.log('addSpecificStops');
    if (!this.selectedRegion) {
      this.toast('No region selected.');
    } else if (!this.stopNumber || !this.stopNumber.toString().trim()) {
      console.log('addSpecificStops stop invalid.');
      this.toast('Stop number invalid.');
    } else {
      this.coordsPromise.then(coords => {
        this.obaService.getSpecificStop(this.selectedRegion, coords, this.stopNumber).then(stop => {
          this.addStop(stop);
        }).catch(error => {
          this.toast(error);
        });
      });
    }
  }

  regionChanged() {
    this.loadNearbyStops();
  }

  done() {
    this.addStopsDone.emit(0);
  }

  private toast(message: string) {
    this.snackBar.open(message, undefined, {
      duration: 500
    });
  }
}
