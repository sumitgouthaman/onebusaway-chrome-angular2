import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MdCardModule,
} from '@angular/material';
import { StopDetailsComponent } from './stop-details.component';
import { Region, Stop, ObaService, ArrivalDeparture } from '../../oba/oba.service';
import { MdSnackBarConfig, MdSnackBar } from '@angular/material';
import { StorageService } from '../../storage/storage.service';
import { BootstrapTableComponent } from '../../bootstrap-table/bootstrap-table.component';

describe('StopDetailsComponent', () => {
  let component: StopDetailsComponent;
  let fixture: ComponentFixture<StopDetailsComponent>;

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
  const inputStop: Stop = {
    code: 'code1',
    direction: 'N',
    formattedDirection: 'North bound',
    id: 'id1',
    name: 'stop1',
    region: region,
  };
  const arrivalDepartures: Array<ArrivalDeparture> = [
    {
      routeLongName: 'route1',
      routeShortName: 'R111',
      scheduledArrivalTime: 1234,
      relativeScheduledArrivalTime: '1 min',
      predictedArrivalTime: 1235,
      relativePredictedArrivalTime: '2 min',
      tripHeadsign: 'head1',
    },
    {
      routeLongName: 'route2',
      routeShortName: 'R222',
      scheduledArrivalTime: 1234,
      relativeScheduledArrivalTime: '3 min',
      predictedArrivalTime: 1235,
      relativePredictedArrivalTime: '4 min',
      tripHeadsign: 'head2',
    }
  ];

  beforeEach(async(() => {
    const obaServiceStub = {
      getArrivalDepartures(stop: Stop) {
        return new Promise<Array<ArrivalDeparture>>(resolve => {
          resolve(this.arrivalDepartures);
        });
      }
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
        MdCardModule,
      ],
      declarations: [
        StopDetailsComponent,
        BootstrapTableComponent,
      ],
      providers: [
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
    fixture = TestBed.createComponent(StopDetailsComponent);
    component = fixture.componentInstance;
    component.stop = inputStop;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
