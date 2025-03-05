import { Injectable } from '@angular/core';
import {CookieService} from "ngx-cookie-service";
import {WindowService} from './common/window.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private cookieService: CookieService, private windowService: WindowService ) { }

  public createUserID(token:any){
    this.cookieService.set('user-token-id',token, {expires: 60* 60* 24* 7, path: '/', sameSite: 'Strict', secure: true});
  }

  createSession(user: any) {
    if (this.windowService.nativeSessionStorage)
      sessionStorage.setItem('access_token', user.access_token);
  }

  public logout(){
    this.cookieService.deleteAll();
    if (this.windowService.nativeSessionStorage)
      sessionStorage.clear();
  }

  public isExists():boolean{
    let user = this.cookieService.get('user-token-id');
    return user.length !== 0; //user.length === 0?false:true
  }

  public userID() {
    return this.cookieService.get('user-token-id').toString();
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

  public acceptAllCookies() {
    this.cookieService.set('cookies-accepted', 'true', 60*60*24*20);
  }

  public isCookiesAccepted() {
    let cookie = this.cookieService.get('cookies-accepted');
    return cookie.length !== 0;
  }

}
