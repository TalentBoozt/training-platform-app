import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CredentialService {

  baseUrl = environment.apiUrl;
  baseUrlSimple = environment.apiUrlSimple;

  constructor(private http: HttpClient) { }

  fetchCredentialByEmployeeId(employeeId: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/portal_credentials/getByEmployeeId/${employeeId}`);
  }

  fetchCredentialByEmail(email: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/portal_credentials/getByEmail/${email}`);
  }

  addCredential(credential: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/portal_credentials/add/${credential.platform}`, credential);
  }

  resetPasswordRequest(email: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/password-reset/request`, { email: email });
  }

  resetPassword(token: any, password: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/password-reset/reset`, { token: token, newPassword: password });
  }

  login(email: any, password: any): Observable<any> {
    return this.http.post(`${this.baseUrlSimple}/api/auth/login`, { email, password });
  }

  register(credential: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrlSimple}/api/auth/login/${credential.platform}`, credential);
  }
}
