import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {WindowService} from '../common/window.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private isDarkTheme: boolean = false;
  private currentColorShading: string = 'purple';
  private themeSubject = new BehaviorSubject<boolean>(this.isDarkTheme);
  private colorSubject = new BehaviorSubject<string>(this.currentColorShading);

  constructor(private windowService: WindowService) {
    this.loadUserPreferences();
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeSubject.next(this.isDarkTheme);
    this.applyTheme();
  }

  changeColorShading(color: string) {
    this.currentColorShading = color;
    this.applyTheme();
    this.colorSubject.next(this.currentColorShading);
  }

  applyTheme() {
    if (this.windowService.nativeDocument) {
      document.body.classList.remove(
        'theme-blue-light', 'theme-blue-dark',
        'theme-green-light', 'theme-green-dark',
        'theme-orange-light', 'theme-orange-dark',
        'theme-red-light', 'theme-red-dark',
        'theme-purple-light', 'theme-purple-dark',
        'theme-mixed-light', 'theme-mixed-dark'
      );

      // Add the new theme based on color and mode
      const themeClass = `theme-${this.currentColorShading}-${this.isDarkTheme ? 'dark' : 'light'}`;
      document.body.classList.add(themeClass);
    }
  }

  isDarkMode() {
    return this.isDarkTheme;
  };

  getThemeObservable() {
    return this.themeSubject.asObservable();
  }

  getColorObservable() {
    return this.colorSubject.asObservable();
  }

  getCurrentColor() {
    return this.currentColorShading;
  }

  /**
   * Load the user's theme preferences from cookies
   */
  private loadUserPreferences() {
    this.detectDefaultTheme();

    this.themeSubject.next(this.isDarkTheme);
    this.colorSubject.next(this.currentColorShading);
    this.applyTheme();
  }

  /**
   * Detect the browser/system default theme and set it
   */
  private detectDefaultTheme() {
    if (this.windowService.nativeWindow) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme = prefersDark;
    }
  }
}
