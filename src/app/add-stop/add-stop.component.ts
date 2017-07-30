import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter
} from '@angular/core';

import { MdSnackBar } from '@angular/material';

import { Region, Stop } from '../oba/oba';
import { ObaService } from '../oba/oba.service';
import { GeoService } from '../geo/geo.service';
import { StorageService } from '../storage/storage.service';

@Component({
  selector: 'app-add-stop',
  templateUrl: './add-stop.component.html',
  styleUrls: ['./add-stop.component.css']
})
export class AddStopComponent implements OnInit, OnChanges {

  @Input() region: Region;
  @Output() addStopsDone: EventEmitter<number> = new EventEmitter<number>();

  coordsPromise: Promise<Coordinates>;
  nearbyStops: Array<Stop>;

  constructor(
    private geoService: GeoService,
    private obaService: ObaService,
    private storageService: StorageService,
    private snackBar: MdSnackBar) {
    this.coordsPromise = this.geoService.getLocation();
  }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (this.region) {
      this.loadNearbyStops();
    }
  }

  private loadNearbyStops() {
    this.coordsPromise.then(coords => {
      this.obaService.getNearbyStops(this.region, coords).then(stops => {
        this.nearbyStops = stops;
      });
    });
  }

  addStop(stop: Stop) {
    this.storageService.addStop(stop).then(result => {
      this.snackBar.open(`Stop# ${stop.code} saved.`, undefined, {
        duration: 500
      });
    }).catch(error => {
      this.snackBar.open(`Error: ${error}`, undefined, {
        duration: 500
      });
    });
  }

  done() {
    this.addStopsDone.emit(0);
  }
}
