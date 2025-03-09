import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Set Timeout Wrapper
  setTimeout(callback: () => void, delay: number): number | null {
    if (this.isBrowser) {
      return window.setTimeout(callback, delay);
    } else {
      console.warn('setTimeout is not supported on this platform');
      return null;
    }
  }

  // Clear Timeout Wrapper
  clearTimeout(timeoutId: number | null): void {
    if (this.isBrowser && timeoutId !== null) {
      window.clearTimeout(timeoutId);
    }
  }

  // Set Interval Wrapper
  setInterval(callback: () => void, interval: number): number | null {
    if (this.isBrowser) {
      return window.setInterval(callback, interval);
    } else {
      console.warn('setInterval is not supported on this platform');
      return null;
    }
  }

  // Clear Interval Wrapper
  clearInterval(intervalId: number | null): void {
    if (this.isBrowser && intervalId !== null) {
      window.clearInterval(intervalId);
    }
  }
}
