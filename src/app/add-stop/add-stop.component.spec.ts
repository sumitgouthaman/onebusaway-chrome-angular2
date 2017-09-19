import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import {
  MdSelectModule,
  MdSnackBar,
  MdSnackBarConfig,
} from '@angular/material';

import { BootstrapTableComponent } from '../bootstrap-table/bootstrap-table.component';
import { AddStopComponent } from './add-stop.component';
import { GeoService } from '../geo/geo.service';
import { ObaService, Region, Stop } from '../oba/oba.service';
import { StorageService } from '../storage/storage.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AddStopComponent', () => {
  let component: AddStopComponent;
  let fixture: ComponentFixture<AddStopComponent>;

  const regions: Array<Region> = [
    {
      obaBaseUrl: 'reg1url',
      regionName: 'reg1',
    },
    {
      obaBaseUrl: 'reg2url',
      regionName: 'reg2',
    },
  ];
  const stops: Array<Stop> = [
    {
      code: 'code1',
      direction: 'N',
      formattedDirection: 'North bound',
      id: 'id1',
      name: 'stop1',
      region: regions[0],
    },
    {
      code: 'code2',
      direction: 'S',
      formattedDirection: 'South bound',
      id: 'id2',
      name: 'stop2',
      region: regions[0],
    },
  ];

  beforeEach(async(() => {
    const geoServiceStub = {
      getLocation() {
        return new Promise<Coordinates>(resolve => {
          const coords: Coordinates = {
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            latitude: 101,
            longitude: 102,
            speed: null,
          };
          resolve(coords);
        });
      }
    };

    const obaServiceStub = {
      getRegions() {
        return new Promise<Array<Region>>(resolve => {
          resolve(regions);
        });
      },
      getDefaultRegion() {
        return new Promise<Region>(resolve => {
          resolve(regions[0]);
        });
      },
      getNearbyStops(region: Region, coords: Coordinates) {
        return new Promise<Array<Stop>>(resolve => {
          resolve(stops);
        });
      },
      getSpecificStop(region: Region, coords: Coordinates, stopNumber: number) {
        return new Promise<Stop>(resolve => {
          resolve(stops[0]);
        });
      },
    };

    const storageServiceStub = {
      addStop(stop: Stop) {
        return new Promise<boolean>(resolve => resolve(true));
      },
    };

    const mdSnackBarStub = {
      open(message: string, action?: string, config?: MdSnackBarConfig) {},
    };

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MdSelectModule,
        NoopAnimationsModule,
      ],
      declarations: [
        AddStopComponent,
        BootstrapTableComponent,
      ],
      providers: [
        {
          provide: GeoService,
          useValue: geoServiceStub
        },
        {
          provide: ObaService,
          useValue: obaServiceStub
        },
        {
          provide: StorageService,
          useValue: storageServiceStub
        },
        {
          provide: MdSnackBar,
          useValue: mdSnackBarStub
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    this.geoService = TestBed.get(GeoService);
    this.obaService = TestBed.get(ObaService);
    this.storageService = TestBed.get(StorageService);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
