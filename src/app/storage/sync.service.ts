import { Injectable } from '@angular/core';

@Injectable()
export class SyncService {

  constructor() { }

  get(key: string, callback: (data) => void) {
    chrome.storage.sync.get(key, callback);
  }

  set(data: any, callback: () => void) {
    chrome.storage.sync.set(data, callback);
  }
}
