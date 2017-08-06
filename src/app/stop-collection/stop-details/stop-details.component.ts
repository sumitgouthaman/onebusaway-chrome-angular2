import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { Stop, ArrivalDeparture } from '../../oba/oba';
import { StorageService } from '../../storage/storage.service';
import { ObaService } from '../../oba/oba.service';

import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-stop-details',
  templateUrl: './stop-details.component.html',
  styleUrls: ['./stop-details.component.css']
})
export class StopDetailsComponent implements OnInit {

  @Input() stop: Stop;

  arrivalDepartures: Array<ArrivalDeparture>;
  errorLoadingStops = false;

  constructor(
    private storageService: StorageService,
    private obaService: ObaService,
    private snackBar: MdSnackBar,
  ) { }

  ngOnInit() {
    this.refresh();
  }

  refresh(notify: boolean = false) {
    if (this.stop) {
      this.obaService.getArrivalDepartures(this.stop).then(arrivalDepartures => {
        this.arrivalDepartures = arrivalDepartures;
        this.errorLoadingStops = false;
        if (notify) {
          this.snackBar.open(`Stop# ${this.stop.code} updated.`, undefined, {
            duration: 200
          });
        }
      }).catch(error => {
        console.error(error);
        this.errorLoadingStops = true;
      });
    }
  }

  deleteStop() {
    this.storageService.removeStop(this.stop).then(() => {
      this.snackBar.open(`Stop# ${this.stop.code} deleted.`, undefined, {
        duration: 500
      });
    });
  }
}
