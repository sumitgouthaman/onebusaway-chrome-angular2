import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  MdToolbarModule,
  MdSelectModule,
} from '@angular/material';
import { AppComponent } from './app.component';
import { AddStopComponent } from './add-stop/add-stop.component';
import { BootstrapTableComponent } from './bootstrap-table/bootstrap-table.component';
import { StopCollectionComponent } from './stop-collection/stop-collection.component';
import { StopDetailsComponent } from './stop-collection/stop-details/stop-details.component';
import { StorageService } from './storage/storage.service';
import { Region, Stop } from './oba/oba.service';

describe('AppComponent', () => {
  const region: Region = {
    obaBaseUrl: 'reg1url',
    regionName: 'reg1',
    experimental: false,
    bounds: [
      {
        lat: 5,
        latSpan: 2,
        lon: 15,
        lonSpan: 4
      }
    ]
  };
  const stops: Array<Stop> = [
    {
      code: 'code1',
      direction: 'N',
      formattedDirection: 'North bound',
      id: 'id1',
      name: 'stop1',
      region: region,
    },
    {
      code: 'code2',
      direction: 'S',
      formattedDirection: 'South bound',
      id: 'id2',
      name: 'stop2',
      region: region,
    },
  ];

  beforeEach(async(() => {
    const storageServiceStub = {
      getAllStops(): Promise<Array<Stop>> {
        return new Promise<Array<Stop>>(resolve => {
          resolve(stops);
        });
      },
      subscribeToAdd(onAdd: (stop: Stop) => void) { },
      subscribeToRemove(onRemove: (stop: Stop) => void) { }
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdToolbarModule,
        MdSelectModule,
      ],
      declarations: [
        AddStopComponent,
        BootstrapTableComponent,
        StopCollectionComponent,
        StopDetailsComponent,
        AppComponent,
      ],
      providers: [
        {
          provide: StorageService,
          useValue: storageServiceStub
        },
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#obatitle').textContent).toContain('One Bus Away');
  }));
});
