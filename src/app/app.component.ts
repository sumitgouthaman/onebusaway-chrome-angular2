import { Component } from '@angular/core';
import { ObaRegionsModule as Regions } from './oba-regions/oba-regions.module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  regions: any = Regions.getRegions();
  selectedRegion: any = Regions.getDefaultRegion(this.regions);
}
