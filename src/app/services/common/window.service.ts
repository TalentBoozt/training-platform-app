import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get nativeWindow(): Window | null {
    return this.isBrowser ? window : null;
  }

  get nativeDocument(): Document | null {
    return this.isBrowser ? document : null;
  }

  get nativeLocalStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  get nativeSessionStorage(): Storage | null {
    return this.isBrowser ? sessionStorage : null;
  }
}
