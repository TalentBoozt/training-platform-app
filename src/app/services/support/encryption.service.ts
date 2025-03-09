import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {environment} from "../../../environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async encryptPassword(password: string): Promise<string | any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    try {
      let response;
      response =  await this.http.post<any>(`${this.baseUrl}/encryption/encrypt`, {data: password}, {headers}).toPromise();
      return response?.data as string;
    } catch (error:any) {
      console.error('Error during encryption:', error?.data);
      throw new Error('Encryption failed');
    }
  }

  async decryptPassword(encryptedPassword: string): Promise<string | any> {
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa('admin:password')
    });
    try {
      let response;
      response =  await this.http.post<any>(`${this.baseUrl}/encryption/decrypt`, {data: encryptedPassword}, {headers}).toPromise();
      return response?.data as string;
    } catch (error:any) {
      console.error('Error during decryption:', error?.data);
      throw new Error('Decryption failed');
    }
  }

  checkLeakedPassword(password: string) {
    const sha1Hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
    const hashPrefix = sha1Hash.substring(0, 5);
    const hashSuffix = sha1Hash.substring(5);

    return this.http.get(`https://api.pwnedpasswords.com/range/${hashPrefix}`, { responseType: 'text' })
      .toPromise()
      .then((response: any) => {
        const lines = response.split('\n');
        return lines.some((line:any) => line.startsWith(hashSuffix));
      });
  }
}
