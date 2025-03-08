import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocialAuthApiService {

  baseUrl = environment.apiUrl
  constructor(private http: HttpClient) { }

  loginWithOAuth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/oauth2/success`);
  }

  // Fetch user profile details
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/profile`);
  }
}
