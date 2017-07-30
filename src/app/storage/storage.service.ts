import { Injectable } from '@angular/core';

import { Stop } from '../oba/oba';

@Injectable()
export class StorageService {

  private savedStopsKey = 'savedStops';

  constructor() { }

  getAllStops(): Promise<Array<Stop>> {
    return new Promise<Array<Stop>>(resolve => {
      chrome.storage.sync.get(this.savedStopsKey, data => {
        let existingStops: Array<Stop>;
        if (data[this.savedStopsKey]) {
          existingStops = data[this.savedStopsKey];
        } else {
          existingStops = [];
        }

        resolve(existingStops);
      });
    });
  }

  addStop(stop: Stop): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.getAllStops().then(existingStops => {
        if (existingStops.every(s => s.id !== stop.id)) {
          existingStops.push(stop);
          const dataToStore: any = {};
          dataToStore[this.savedStopsKey] = existingStops;
          chrome.storage.sync.set(dataToStore, () => {
            resolve(true);
          });
        } else {
          reject('Stop already in saved stops.');
        }
      });
    });
  }

  removeStop(stop: Stop): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.getAllStops().then(existingStops => {
        const filteredStops = existingStops.filter(s => s.id !== stop.id);
        const dataToStore: any = {};
        dataToStore[this.savedStopsKey] = filteredStops;
        chrome.storage.sync.set(dataToStore, () => {
          resolve(true);
        });
      });
    });
  }
}
