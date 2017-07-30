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

@NgModule({
  declarations: [
    AppComponent,
    AddStopComponent
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
