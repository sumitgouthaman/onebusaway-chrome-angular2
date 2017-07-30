import { TestBed, inject } from '@angular/core/testing';

import { ObaService } from './oba.service';

describe('ObaServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObaService]
    });
  });

  it('should be created', inject([ObaService], (service: ObaService) => {
    expect(service).toBeTruthy();
  }));
});
