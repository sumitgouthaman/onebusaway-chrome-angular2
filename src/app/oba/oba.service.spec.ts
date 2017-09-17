import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ObaService } from './oba.service';

describe('ObaServiceService', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ObaService]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([ObaService], (service: ObaService) => {
    expect(service).toBeTruthy();
  }));
});
