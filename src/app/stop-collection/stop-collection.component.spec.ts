import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MdCardModule,
} from '@angular/material';
import { StopCollectionComponent } from './stop-collection.component';
import { StopDetailsComponent } from './stop-details/stop-details.component';
import { BootstrapTableComponent } from '../bootstrap-table/bootstrap-table.component';
import { Region, Stop } from '../oba/oba.service';
import { StorageService } from '../storage/storage.service';

describe('StopCollectionComponent', () => {
  let component: StopCollectionComponent;
  let fixture: ComponentFixture<StopCollectionComponent>;

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
  const newStop: Stop = {
    code: 'code3',
    direction: 'W',
    formattedDirection: 'West bound',
    id: 'id3',
    name: 'stop3',
    region: region,
  };

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
        MdCardModule,
      ],
      declarations: [
        BootstrapTableComponent,
        StopDetailsComponent,
        StopCollectionComponent,
      ],
      providers: [
        {
          provide: StorageService,
          useValue: storageServiceStub
        },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StopCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
