import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { StorageService } from '../storage/storage.service';
import { Stop } from '../oba/oba';

import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-stop-collection',
  templateUrl: './stop-collection.component.html',
  styleUrls: ['./stop-collection.component.css']
})
export class StopCollectionComponent implements OnInit {

  stops: Array<Stop>;

  constructor(
    private storageService: StorageService,
  ) {
    this.loadSavedStops();
    this.storageService.subscribeToAdd(stop => this.onStopAdded(stop));
    this.storageService.subscribeToRemove(stop => this.onStopDeleted(stop));
  }

  private loadSavedStops() {
    this.stops = null;
    this.storageService.getAllStops().then(stops => {
      this.stops = stops;
    });
  }

  private onStopAdded(stop: Stop) {
    console.log('onStopAdded called.');
    const stopIndex = this.stops.indexOf(stop);
    if (stopIndex === -1) {
      this.stops.push(stop);
    }
  }

  private onStopDeleted(stop: Stop) {
    console.log('onStopDeleted called.');
    const stopIndex = this.stops.indexOf(stop);
    if (stopIndex !== -1) {
      this.stops.splice(stopIndex, 1);
    }
  }

  ngOnInit() {
  }
}
