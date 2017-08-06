import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  addStopsMode = false;

  constructor () {
  }

  ngOnInit(): void {
  }

  toggleAddStopsMode() {
    this.addStopsMode = !this.addStopsMode;
  }
}
