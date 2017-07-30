import {
  Component,
  OnInit,
  Output,
  EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-stop',
  templateUrl: './add-stop.component.html',
  styleUrls: ['./add-stop.component.css']
})
export class AddStopComponent implements OnInit {

  @Output() addStopsDone: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
  }

  done() {
    this.addStopsDone.emit(0);
  }
}
