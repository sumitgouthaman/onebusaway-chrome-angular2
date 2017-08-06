import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-bootstrap-table',
  templateUrl: './bootstrap-table.component.html',
  styleUrls: ['./bootstrap-table.component.css']
})
export class BootstrapTableComponent<T> implements OnInit {

  @Input() items: Array<T>;
  /**
   * Columns represented by 2d array.
   *
   * Each row represents a table column. First item in each row is column's
   * friendly name. The second item is the key in the item object.
   */
  @Input() columns: Array<Array<string>>;
  @Output() itemClicked: EventEmitter<T>;
  // Message if no rows to display
  @Input() emptyMessage: string;

  constructor() {
    this.itemClicked = new EventEmitter<T>();
  }

  ngOnInit() {
  }

  handleClick(item: T) {
    this.itemClicked.emit(item);
  }

}
