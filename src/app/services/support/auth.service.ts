import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {WindowService} from '../common/window.service';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService, private windowService: WindowService) { }

  public createUserID(token:any){
    this.cookieService.set('user-token-id',token, {expires: 60* 60* 24* 7, path: '/', sameSite: 'Strict', secure: true});
  }

  public createOrganizationID(token:any){
    this.cookieService.set('organization',token, 60*60*24*7);
  }

  public createLevel(token:any){
    this.cookieService.set('level', token, {expires: 60* 60* 24* 7, path: '/', sameSite: 'Strict', secure: true});
  }

  public createAdmin(token:string){
    this.cookieService.set('admin-token',token,60*60*24*7);
  }

  public createProAdmin(token:string){
    this.cookieService.set('pro-admin-token',token,60*60*24*7);
  }

  createSession(user: any) {
    if (this.windowService.nativeSessionStorage){
      sessionStorage.setItem('access_token', user.access_token);
    }
  }

  public logout(){
    this.cookieService.deleteAll();
    if (this.windowService.nativeSessionStorage){
      sessionStorage.clear();
    }
  }

  public isExists():boolean{
    let user = this.cookieService.get('user-token-id');
    return user.length !== 0; //user.length === 0?false:true
  }

  public isAdmin():boolean{
    let admin = this.cookieService.get('admin-token');
    return admin.length !== 0;
  }

  public isProAdmin():boolean{
    let proAdmin = this.cookieService.get('pro-admin-token');
    return proAdmin.length !== 0;
  }

  public isOrganization():boolean{
    let org = this.cookieService.get('organization');
    return org.length !== 0;
  }

  public userID() {
    return this.cookieService.get('user-token-id').toString();
  }

  public adminEmail() {
    return this.cookieService.get('admin-token').toString();
  }

  public organization() {
    return this.cookieService.get('organization').toString();
  }

  public level() {
    return this.cookieService.get('level').toString();
  }

  public lock() {
    return this.cookieService.set('locked', 'true');
  }

  public unlock() {
    return this.cookieService.delete('locked');
  }

  public isLocked() {
    let locked = this.cookieService.get('locked');
    return locked.length !== 0;
  }

  public setThemeMode(themeMode: string) {
    this.cookieService.set('theme-mode', themeMode, 60*60*24*30);
  }

  public getThemeMode() {
    return this.cookieService.get('theme-mode');
  }

  public setThemeColor(themeColor: string) {
    this.cookieService.set('theme-color', themeColor, 60*60*24*30);
  }

  public getThemeColor() {
    return this.cookieService.get('theme-color');
  }

  public acceptAllCookies() {
    this.cookieService.set('cookies-accepted', 'true', 60*60*24*20);
  }

  public necessaryCookiesOnly() {
    this.cookieService.set('cookies-accepted', 'false', 60*60*24*20);
  }

  public isCookiesAccepted() {
    let cookie = this.cookieService.get('cookies-accepted');
    return cookie.length !== 0;
  }

  public createReferer(referer: string) {
    this.cookieService.set('referer', referer, 60*60*24*30);
  }

  public createPlatform(platform: string) {
    this.cookieService.set('platform', platform, 60*60*24*30);
  }

  public createPromotion(promotion: string) {
    this.cookieService.set('promotion', promotion, 60*60*24*30);
  }

  public getReferer() {
    return this.cookieService.get('referer');
  }

  public getPlatform() {
    return this.cookieService.get('platform');
  }

  public getPromotion() {
    return this.cookieService.get('promotion');
  }

  public createAuthToken(token: string) {
    this.cookieService.set('jwtToken', token, { path: '/', secure: true, sameSite: 'Strict' });
  }

  getAuthToken(): string | null {
    return this.cookieService.get('jwtToken');
  }

  isAuthToken(): boolean {
    return !!this.getAuthToken();
  }

  public createRefreshToken(refreshToken: string) {
    this.cookieService.set('refreshToken', refreshToken, { path: '/', secure: true, sameSite: 'Strict' });
  }

  public getRefreshToken(): string | null {
    return this.cookieService.get('refreshToken');
  }

  isRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }
}
