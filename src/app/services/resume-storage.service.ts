import { Injectable } from '@angular/core';
import {WindowService} from './common/window.service';

@Injectable({
  providedIn: 'root'
})
export class ResumeStorageService {

  private storageKey = 'resumeData';

  constructor(private windowService: WindowService ) {}

  saveData(step: string, data: any): void {
    let resumeData = this.getData();
    resumeData[step] = data;
    if (this.windowService.nativeLocalStorage)
      localStorage.setItem(this.storageKey, JSON.stringify(resumeData));
  }

  getData(): any {
    if (this.windowService.nativeLocalStorage){
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    }
  }

  clearData(): void {
    if (this.windowService.nativeLocalStorage)
      localStorage.removeItem(this.storageKey);
  }
}
