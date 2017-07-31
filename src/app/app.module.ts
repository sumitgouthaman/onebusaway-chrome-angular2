import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';

// Angular material 2 related imports
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';
import {
  MdToolbarModule,
  MdIconModule,
  MdSelectModule,
  MdCardModule,
  MdButtonModule,
  MdProgressBarModule,
  MdListModule,
  MdSnackBarModule,
} from '@angular/material';

import { AppComponent } from './app.component';
import { AddStopComponent } from './add-stop/add-stop.component';

import { ObaService } from './oba/oba.service';
import { GeoService } from './geo/geo.service';
import { StorageService } from './storage/storage.service';
import { StopDetailsComponent } from './stop-collection/stop-details/stop-details.component';
import { StopCollectionComponent } from './stop-collection/stop-collection.component';

@NgModule({
  declarations: [
    AppComponent,
    AddStopComponent,
    StopDetailsComponent,
    StopCollectionComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    MdToolbarModule,
    MdIconModule,
    MdSelectModule,
    MdCardModule,
    MdButtonModule,
    MdProgressBarModule,
    MdListModule,
    MdSnackBarModule
  ],
  providers: [
    ObaService,
    GeoService,
    StorageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
