import { TestBed, inject } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { Stop } from '../oba/oba.service';
import { SyncService } from './sync.service';

describe('StorageService', () => {
  let sampleSavedData = null;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StorageService, SyncService]
    });
    sampleSavedData = {
      'savedStops': [
        {
          id: '111'
        },
        {
          id: '222'
        }
      ]
    };
  });

  it('should be created', inject([StorageService], (service: StorageService) => {
    expect(service).toBeTruthy();
  }));

  it('getAllStops with no saved stops returns []', (done) => {
    const syncService = new SyncService();
    const syncServiceSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda({});
    });
    const storageService = new StorageService(syncService);
    storageService.getAllStops().then(stops => {
      expect(syncServiceSpy.calls.count()).toBe(1);
      expect(stops.length).toBe(0);
      done();
    });
  });

  it('getAllStops with some saved stops returns stops', (done) => {
    const syncService = new SyncService();
    const syncServiceSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const storageService = new StorageService(syncService);
    storageService.getAllStops().then(stops => {
      expect(syncServiceSpy.calls.count()).toBe(1);
      expect(stops.length).toBe(2);
      expect(stops[0].id).toBe('111');
      expect(stops[1].id).toBe('222');
      done();
    });
  });

  it('getAllStops with some saved stops returns stops', (done) => {
    const syncService = new SyncService();
    const syncServiceSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const storageService = new StorageService(syncService);
    storageService.getAllStops().then(stops => {
      expect(syncServiceSpy.calls.count()).toBe(1);
      expect(stops.length).toBe(2);
      expect(stops[0].id).toBe('111');
      expect(stops[1].id).toBe('222');
      done();
    });
  });

  it('addStop with no existing stops works', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda({});
    });
    const syncServiceSetSpy = spyOn(syncService, 'set').and.callFake((data, lambda) => {
      expect(data.savedStops.length).toBe(1);
      expect(data.savedStops[0].id).toBe('123');
      lambda();
    });
    let numTimesAddListenersCalled = 0;
    const storageService = new StorageService(syncService);
    storageService.subscribeToAdd(stop => {
      numTimesAddListenersCalled++;
      expect(stop.id).toBe('123');
    });
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '123',
      name: null,
      region: null,
    };
    storageService.addStop(dummyStop).then(result => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.count()).toBe(1);
      expect(numTimesAddListenersCalled).toBe(1);
      done();
    });
  });

  it('addStop with other existing stops works', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const syncServiceSetSpy = spyOn(syncService, 'set').and.callFake((data, lambda) => {
      expect(data.savedStops.length).toBe(3);
      expect(data.savedStops[2].id).toBe('123');
      lambda();
    });
    let numTimesAddListenersCalled = 0;
    const storageService = new StorageService(syncService);
    storageService.subscribeToAdd(stop => {
      numTimesAddListenersCalled++;
      expect(stop.id).toBe('123');
    });
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '123',
      name: null,
      region: null,
    };
    storageService.addStop(dummyStop).then(result => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.count()).toBe(1);
      expect(numTimesAddListenersCalled).toBe(1);
      done();
    });
  });

  it('addStop with same existing stop throws', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const syncServiceSetSpy = spyOn(syncService, 'set');
    const storageService = new StorageService(syncService);
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '111',
      name: null,
      region: null,
    };
    storageService.addStop(dummyStop)
    .then(result => {})
    .catch(reject => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.any()).toBeFalsy();
      done();
    });
  });

  it('removeStop with no existing stops works', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda({});
    });
    const syncServiceSetSpy = spyOn(syncService, 'set').and.callFake((data, lambda) => {
      expect(data.savedStops.length).toBe(0);
      lambda();
    });
    let numTimesRemoveListenersCalled = 0;
    const storageService = new StorageService(syncService);
    storageService.subscribeToRemove(stop => {
      numTimesRemoveListenersCalled++;
      expect(stop.id).toBe('123');
    });
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '123',
      name: null,
      region: null,
    };
    storageService.removeStop(dummyStop).then(result => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.count()).toBe(1);
      expect(numTimesRemoveListenersCalled).toBe(1);
      done();
    });
  });

  it('removeStop with other existing stops works', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const syncServiceSetSpy = spyOn(syncService, 'set').and.callFake((data, lambda) => {
      expect(data).toEqual(sampleSavedData);
      lambda();
    });
    let numTimesRemoveListenersCalled = 0;
    const storageService = new StorageService(syncService);
    storageService.subscribeToRemove(stop => {
      numTimesRemoveListenersCalled++;
      expect(stop.id).toBe('123');
    });
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '123',
      name: null,
      region: null,
    };
    storageService.removeStop(dummyStop).then(result => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.count()).toBe(1);
      expect(numTimesRemoveListenersCalled).toBe(1);
      done();
    });
  });

  it('removeStop with existing stop works', (done) => {
    const syncService = new SyncService();
    const syncServiceGetSpy = spyOn(syncService, 'get').and.callFake((key, lambda) => {
      lambda(sampleSavedData);
    });
    const syncServiceSetSpy = spyOn(syncService, 'set').and.callFake((data, lambda) => {
      expect(data.savedStops.length).toBe(1);
      expect(data.savedStops[0].id).toBe('111');
      lambda();
    });
    let numTimesRemoveListenersCalled = 0;
    const storageService = new StorageService(syncService);
    storageService.subscribeToRemove(stop => {
      numTimesRemoveListenersCalled++;
      expect(stop.id).toBe('222');
    });
    const dummyStop = {
      code: null,
      direction: null,
      formattedDirection: null,
      id: '222',
      name: null,
      region: null,
    };
    storageService.removeStop(dummyStop).then(result => {
      expect(syncServiceGetSpy.calls.count()).toBe(1);
      expect(syncServiceSetSpy.calls.count()).toBe(1);
      expect(numTimesRemoveListenersCalled).toBe(1);
      done();
    });
  });
});
