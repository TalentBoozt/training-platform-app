import { Injectable } from '@angular/core';
import {WindowService} from '../common/window.service';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  private timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

  constructor(private windowService: WindowService) {
  }

  getTimezone(): string {
    return this.timezone;
  }

  setTimezone(timezone: string) {
    this.timezone = timezone;
    localStorage.setItem('userTimezone', timezone);
  }

  loadTimezoneFromStorage() {
    if (this.windowService.nativeLocalStorage) {
      const stored = localStorage.getItem('userTimezone');
      if (stored) this.timezone = stored;
    }
  }
}
