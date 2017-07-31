import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { StorageService } from '../storage/storage.service';
import { Stop } from '../oba/oba';

@Component({
  selector: 'app-stop-collection',
  templateUrl: './stop-collection.component.html',
  styleUrls: ['./stop-collection.component.css']
})
export class StopCollectionComponent implements OnInit {

  @Input() stops: Array<Stop>;
  @Output() onDeleteStop: EventEmitter<Stop>;

  constructor() { }

  ngOnInit() {
  }
}
