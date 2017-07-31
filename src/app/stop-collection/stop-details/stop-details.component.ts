import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { Stop } from '../../oba/oba';

@Component({
  selector: 'app-stop-details',
  templateUrl: './stop-details.component.html',
  styleUrls: ['./stop-details.component.css']
})
export class StopDetailsComponent implements OnInit {

  @Input() stop: Stop;
  @Output() stopDeleted: EventEmitter<Stop>;

  constructor() {
    this.stopDeleted = new EventEmitter<Stop>();
  }

  ngOnInit() {
  }

  deleteStop() {
    this.stopDeleted.emit(this.stop);
  }
}
