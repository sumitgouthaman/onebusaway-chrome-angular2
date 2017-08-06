import { Injectable } from '@angular/core';

import { Stop } from '../oba/oba';

@Injectable()
export class StorageService {

  private savedStopsKey = 'savedStops';
  private addListeners: Array<(Stop) => void> = [];
  private removeListeners: Array<(Stop) => void> = [];

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
          console.log('storageService addStop "set" callback.');
            this.addListeners.forEach(func => {
            func(stop);
          });
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
          console.log('storageService removeStop "set" callback.');
          this.removeListeners.forEach(func => {
            func(stop);
          });
          resolve(true);
        });
      });
    });
  }

  subscribeToAdd(onAdd: (stop: Stop) => void) {
    console.log('Add listener added to storageService.');
    this.addListeners.push(onAdd);
  }

  subscribeToRemove(onRemove: (stop: Stop) => void) {
    console.log('Remove listener added to storageService.');
    this.removeListeners.push(onRemove);
  }
}
