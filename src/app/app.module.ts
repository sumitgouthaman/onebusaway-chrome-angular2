import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Angular material 2 related imports
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import 'hammerjs';
import {
  MdToolbarModule,
  MdIconModule,
  MdSelectModule,
  MdCardModule,
  MdButtonModule } from '@angular/material';

import { AppComponent } from './app.component';
import { ObaService } from './oba-regions/oba.service';
import { AddStopComponent } from './add-stop/add-stop.component';

@NgModule({
  declarations: [
    AppComponent,
    AddStopComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    FlexLayoutModule,
    MdToolbarModule,
    MdIconModule,
    MdSelectModule,
    MdCardModule,
    MdButtonModule,
  ],
  providers: [ObaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
